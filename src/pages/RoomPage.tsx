import { useEffect, useRef, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
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
import { useImageInput } from '../room/useImageInput';
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
  const { room, status, activity, dispatch: act } = useRoom(code, myName);
  const boardRef = useRef<HTMLDivElement>(null);

  async function addImages(files: File[]) {
    for (const file of files.filter(f => f.type.startsWith('image/'))) {
      try {
        const name = file.name.replace(/\.[^.]+$/, '').slice(0, 30) || 'Imagen';
        act({ type: 'item:add', item: { id: newId(), name, url: await shrink(file), by: myName } }, `subió ${name}`);
      } catch {
        toast(`No se pudo leer ${file.name}`);
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

  async function download() {
    if (!boardRef.current || !room) return;
    try {
      await exportPng(boardRef.current, room.title.trim());
    } catch {
      toast('No se pudo generar la imagen.');
    }
  }

  if (status === 'missing') return <RoomNotFound code={code} />;

  return (
    <main className={styles.room}>
      <TopBar code={code} status={status} onCopyLink={copyLink} />

      <div className={styles.layout}>
        <div>
          {room ? (
            <>
              <div className={styles.head}>
                <EditableText
                  as="h1"
                  className={styles.title}
                  value={room.title}
                  onChange={title => act({ type: 'title:update', title })}
                  label="Título de la tier list"
                />
                <div className={styles.actions}>
                  <button onClick={addTier}>+ Añadir fila</button>
                  <button className="btn-primary" onClick={download}>Descargar PNG</button>
                </div>
              </div>
              <TierBoard
                room={room}
                boardRef={boardRef}
                fileOver={fileOver}
                act={act}
                onFiles={addImages}
                onBlocked={toast}
              />
            </>
          ) : (
            <p className={styles.loading}>Conectando con la sala…</p>
          )}
        </div>

        <Sidebar activity={activity} />
      </div>
    </main>
  );
}
