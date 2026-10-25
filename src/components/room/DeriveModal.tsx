import { useState } from 'react';
import { Modal } from '../ui/Modal';

interface Props {
  /** Título de la sala actual, como sugerencia */
  title: string;
  count: number;
  onConfirm: (title: string) => Promise<void>;
  onCancel: () => void;
}

/** Crea una sub-tier list: sala nueva con las mismas filas e imágenes, todas sin clasificar */
export function DeriveModal({ title, count, onConfirm, onCancel }: Props) {
  const [value, setValue] = useState(title);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await onConfirm(value.trim());
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title="Crear sub-tier list" onClose={busy ? undefined : onCancel}>
      <p>
        Sala nueva con las mismas filas y las {count === 1 ? 'misma imagen' : `mismas ${count} imágenes`},
        todas sin clasificar. Esta sala no cambia.
      </p>
      <form onSubmit={submit}>
        <label className="field" htmlFor="derive-title">Nombre de la nueva tier list</label>
        <input
          id="derive-title"
          type="text"
          maxLength={80}
          autoFocus
          value={value}
          onChange={e => setValue(e.target.value)}
        />
        <button type="submit" className="btn-primary" disabled={busy} style={{ width: '100%', marginTop: 16, padding: 11 }}>
          {busy ? 'Creando…' : 'Crear'}
        </button>
      </form>
    </Modal>
  );
}
