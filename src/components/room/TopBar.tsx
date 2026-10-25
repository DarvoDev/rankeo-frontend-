import { Link } from 'react-router-dom';
import { cx } from '../../lib/cx';
import type { RoomStatus } from '../../room/useRoom';
import styles from './TopBar.module.css';

interface Props {
  code: string;
  status: RoomStatus;
  /** Sala de la que se derivó esta (sub-tier list) */
  parent?: string;
  onCopyLink: () => void;
}

export function TopBar({ code, status, parent, onCopyLink }: Props) {
  return (
    <div className={styles.topbar}>
      <div className={styles.group}>
        <Link className={styles.back} to="/">← Inicio</Link>
        <span className={styles.code}>{code || '——'}</span>
        <button onClick={onCopyLink}>Copiar enlace</button>
        <span className={cx(styles.status, status === 'online' && styles.online)}>
          {status === 'online' ? 'En línea' : 'Conectando…'}
        </span>
      </div>
      {parent && (
        <Link className={styles.back} to={`/sala/${parent}`} title="Ir a la tier list de la que salió esta">
          ↰ Derivada de <b>{parent}</b>
        </Link>
      )}
    </div>
  );
}
