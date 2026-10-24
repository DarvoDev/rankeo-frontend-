import { useEffect, type ReactNode } from 'react';
import { cx } from '../../lib/cx';
import styles from './Modal.module.css';

interface Props {
  title: string;
  children: ReactNode;
  /** Sin onClose el modal no se puede cerrar (p. ej. pedir apodo) */
  onClose?: () => void;
  className?: string;
}

export function Modal({ title, children, onClose, className }: Props) {
  useEffect(() => {
    if (!onClose) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className={styles.overlay} onClick={e => { if (e.target === e.currentTarget) onClose?.(); }}>
      <div className={cx(styles.card, className)} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        {onClose && <button className={styles.close} onClick={onClose} aria-label="Cerrar">×</button>}
        <h2 id="modal-title">{title}</h2>
        {children}
      </div>
    </div>
  );
}
