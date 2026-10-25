import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { CaptionModal, type CaptionedImage, type PendingImage } from '../components/room/CaptionModal';
import { CursorLayer } from '../components/room/CursorLayer';
import { DeriveModal } from '../components/room/DeriveModal';
import { NameModal } from '../components/room/NameModal';
import { RoomNotFound } from '../components/room/RoomNotFound';
import { Sidebar } from '../components/room/Sidebar';
import { TierBoard } from '../components/room/TierBoard';
import { TopBar } from '../components/room/TopBar';
import { EditableText } from '../components/ui/EditableText';
import { useToast } from '../components/ui/toastContext';
import { MAX_TIERS, TIER_COLORS } from '../lib/demo';
import { exportPng } from '../lib/exportPng';
import { newId, normalizeCode } from '../lib/ids';
import { shrink } from '../lib/image';
import { getName, setName } from '../lib/storage';
import { useCursorBroadcast } from '../room/useCursors';
import { useImageInput } from '../room/useImageInput';
import { roomService } from '../room/roomService';
import { useRoom } from '../room/useRoom';
import styles from './RoomPage.module.css';

export default function RoomPage() {
  const { codigo } = useParams();
  const code = normalizeCode(codigo);
  const [myName, setMyName] = useState(getName);

  if (!myName) {
    return (
      <NameModal onSubmit={name => { setName(name); setMyName(name); }} />
    );
  }
  return <RoomView key={code} code={code} myName={myName} />;
}

function RoomView({ code, myName }: { code: string; myName: string }) {
  const toast = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const { room, status, activity, people, dispatch: act } = useRoom(code, myName);
  const boardRef = useRef<HTMLDivElement>(null);
  // Tablero + banco: origen de coordenadas de los punteros compartidos
  const areaRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  // Imágenes ya recortadas que esperan su subtítulo antes de subirse
  const [pending, setPending] = useState<PendingImage[]>([]);
  const [deriving, setDeriving] = useState(false);

  useCursorBroadcast(code, areaRef, status === 'online', dragging);

  // Recorta y abre el modal de subtítulos; la subida ocurre al confirmar
  async function addImages(files: File[]) {
    const ready: PendingImage[] = [];
    for (const file of files.filter(f => f.type.startsWith('image/'))) {
      const name = file.name.replace(/\.[^.]+$/, '').slice(0, 30) || 'Imagen';
      try {
        ready.push({ url: await shrink(file), name });
      } catch {
        toast(`No se pudo leer ${file.name}`);
      }
    }
    if (ready.length) setPending(prev => [...prev, ...ready]);
  }

  async function upload(images: CaptionedImage[]) {
    setPending([]);
    for (const image of images) {
      try {
        await roomService.addImage(code, image.url, image.name, myName, image.caption || undefined);
      } catch (error) {
        toast((error as Error).message);
      }
    }
  }
  const fileOver = useImageInput(addImages, status === 'online');

  useEffect(() => {
    if (room) document.title = `${room.title} · Rankeo`;
  }, [room]);

  const created = (location.state as { created?: boolean } | null)?.created;
  useEffect(() => {
    if (status === 'online' && created) toast(`Sala creada. Código: ${code}`);
  }, [status, created, code, toast]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast('Enlace copiado. ¡Compártelo con tu grupo!');
    } catch {
      prompt('Copia este enlace:', window.location.href);
    }
  }

  function addTier() {
    if (!room) return;
    if (room.tiers.length >= MAX_TIERS) return toast(`Máximo ${MAX_TIERS} filas.`);
    act({ type: 'tier:add', id: newId(), color: TIER_COLORS[room.tiers.length % TIER_COLORS.length] }, 'añadió una fila');
  }

  async function derive(title: string) {
    try {
      const child = await roomService.derive(code, title, myName);
      setDeriving(false);
      navigate(`/sala/${child.code}`, { state: { created: true } });
    } catch (error) {
      toast((error as Error).message);
    }
  }

  async function download() {
    if (!boardRef.current || !room) return;
    try {
      await exportPng(boardRef.current, room.title.trim());
    } catch {
      toast('No se pudo generar la imagen.');
    }
  }

  if (status === 'missing') return <RoomNotFound code={code} />;

  const total = room ? Object.keys(room.items).length : 0;

  return (
    <main className={styles.room}>
      <TopBar code={code} status={status} parent={room?.parent} onCopyLink={copyLink} />

      <div className={styles.layout}>
        <div>
          {room ? (
            <>
              <div className={styles.head}>
                <div className={styles.titleGroup}>
                  <EditableText
                    as="h1"
                    className={styles.title}
                    value={room.title}
                    onChange={title => act({ type: 'title:update', title })}
                    label="Título de la tier list"
                  />
                  <span className={styles.count} aria-live="polite">
                    {total === 1 ? '1 imagen' : `${total} imágenes`} · {room.pool.length} sin clasificar
                  </span>
                </div>
                <div className={styles.actions}>
                  <button onClick={addTier}>+ Añadir fila</button>
                  <button onClick={() => setDeriving(true)} title="Sala nueva con las mismas imágenes, sin clasificar">
                    Sub-tier list
                  </button>
                  <button className="btn-primary" onClick={download}>Descargar PNG</button>
                </div>
              </div>
              <div ref={areaRef} className={styles.area}>
                <TierBoard
                  room={room}
                  boardRef={boardRef}
                  fileOver={fileOver}
                  act={act}
                  onFiles={addImages}
                  onBlocked={toast}
                  onDragChange={setDragging}
                />
                <CursorLayer code={code} people={people} items={room.items} />
              </div>
            </>
          ) : (
            <p className={styles.loading}>Conectando con la sala…</p>
          )}
        </div>

        <Sidebar activity={activity} people={people} />
      </div>

      {pending.length > 0 && (
        <CaptionModal pending={pending} onConfirm={upload} onCancel={() => setPending([])} />
      )}
      {deriving && room && (
        <DeriveModal title={room.title} count={total} onConfirm={derive} onCancel={() => setDeriving(false)} />
      )}
    </main>
  );
}
