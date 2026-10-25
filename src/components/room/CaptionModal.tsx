import { useState } from 'react';
import { Modal } from '../ui/Modal';
import styles from './CaptionModal.module.css';

/** Imagen ya recortada, a la espera de su subtítulo */
export interface PendingImage {
  url: string;
  name: string;
}

export interface CaptionedImage extends PendingImage {
  caption: string;
}

export const CAPTION_MAX = 80;

interface Props {
  pending: PendingImage[];
  onConfirm: (images: CaptionedImage[]) => void;
  onCancel: () => void;
}

/** Pide nombre y subtítulo de cada imagen antes de subirla */
export function CaptionModal({ pending, onConfirm, onCancel }: Props) {
  const [names, setNames] = useState<Record<number, string>>({});
  const [captions, setCaptions] = useState<Record<number, string>>({});
  const many = pending.length > 1;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    onConfirm(pending.map((p, i) => ({
      url: p.url,
      name: (names[i] ?? p.name).trim().slice(0, 30) || 'Imagen',
      caption: (captions[i] ?? '').trim().slice(0, CAPTION_MAX),
    })));
  }

  return (
    <Modal title={many ? `Subtítulos (${pending.length} imágenes)` : 'Subtítulo de la imagen'} onClose={onCancel} className={styles.card}>
      <p>El subtítulo se ve al pasar el cursor sobre la imagen. Puedes dejarlo vacío.</p>
      <form onSubmit={submit}>
        <ol className={styles.list}>
          {pending.map((p, i) => (
            <li key={i} className={styles.row}>
              <img src={p.url} alt="" />
              <div className={styles.fields}>
                <input
                  type="text"
                  maxLength={30}
                  value={names[i] ?? p.name}
                  onChange={e => setNames(n => ({ ...n, [i]: e.target.value }))}
                  aria-label={`Nombre de la imagen ${i + 1}`}
                  placeholder="Nombre"
                />
                <input
                  type="text"
                  maxLength={CAPTION_MAX}
                  value={captions[i] ?? ''}
                  onChange={e => setCaptions(c => ({ ...c, [i]: e.target.value }))}
                  aria-label={`Subtítulo de la imagen ${i + 1}`}
                  placeholder="Subtítulo"
                  autoFocus={i === 0}
                />
              </div>
            </li>
          ))}
        </ol>
        <div className={styles.actions}>
          <button type="button" onClick={onCancel}>Cancelar</button>
          <button type="submit" className="btn-primary">{many ? `Subir ${pending.length} imágenes` : 'Subir imagen'}</button>
        </div>
      </form>
    </Modal>
  );
}
