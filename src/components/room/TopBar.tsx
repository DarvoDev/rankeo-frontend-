import { Link } from 'react-router-dom';
import { cx } from '../../lib/cx';
import type { RoomStatus } from '../../room/useRoom';
import styles from './TopBar.module.css';

interface Props {
  code: string;
  status: RoomStatus;
  onCopyLink: () => void;
}

export function TopBar({ code, status, onCopyLink }: Props) {
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
    </div>
  );
}
