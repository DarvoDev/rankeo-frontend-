import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DEMO_CODE } from '../../lib/demo';
import { normalizeCode } from '../../lib/ids';
import { roomService } from '../../room/roomService';
import { Modal } from '../ui/Modal';
import styles from './JoinModal.module.css';

export function JoinModal({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [searching, setSearching] = useState(false);

  async function join(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const normalized = normalizeCode(code);
    if (normalized.length !== 6) {
      setError('El código tiene 6 caracteres.');
      return;
    }
    setSearching(true);
    try {
      if (await roomService.exists(normalized)) {
        navigate(`/sala/${normalized}`);
        return;
      }
      setError(`No existe ninguna sala con el código ${normalized}.`);
    } catch (error) {
      setError((error as Error).message);
    }
    setSearching(false);
  }

  return (
    <Modal title="Unirse a una sala" onClose={onClose} className={styles.card}>
      <p>Escribe el código de 6 letras que te compartieron.</p>
      <form className={styles.row} onSubmit={join}>
        <input
          type="text"
          value={code}
          onChange={e => setCode(e.target.value)}
          maxLength={6}
          placeholder="CÓDIGO"
          autoComplete="off"
          aria-label="Código de sala"
          autoFocus
        />
        <button type="submit" className="pill-white" disabled={searching}>
          {searching ? 'Buscando…' : 'Unirse'}
        </button>
      </form>
      <p className={styles.hint}>
        ¿Sin código? Prueba con <button type="button" onClick={() => setCode(DEMO_CODE)}>{DEMO_CODE}</button>
      </p>
      <p className="error" role="alert">{error}</p>
    </Modal>
  );
}
