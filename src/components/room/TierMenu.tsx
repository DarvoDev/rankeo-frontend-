import { useEffect, useRef, useState } from 'react';
import { cx } from '../../lib/cx';
import { TIER_COLORS } from '../../lib/demo';
import styles from './TierMenu.module.css';

interface Props {
  label: string;
  color: string;
  canUp: boolean;
  canDown: boolean;
  onColor: (color: string) => void;
  onMove: (dir: 'up' | 'down') => void;
  onClear: () => void;
  onDelete: () => void;
}

/** Botón ⚙ de cada fila con su menú de opciones */
export function TierMenu({ label, color, canUp, canDown, onColor, onMove, onClear, onDelete }: Props) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Cierra al tocar fuera o con Escape
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const closeAfter = (fn: () => void) => () => { fn(); setOpen(false); };

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <button
        className={styles.toggle}
        onClick={() => setOpen(o => !o)}
        aria-label={`Opciones de la fila ${label}`}
        aria-expanded={open}
      >
        ⚙
      </button>
      {open && (
        <div className={styles.menu} role="menu">
          <div className={styles.swatches}>
            {TIER_COLORS.map(c => (
              <button
                key={c}
                className={cx(c === color && styles.active)}
                style={{ background: c }}
                onClick={() => onColor(c)}
                aria-label={`Color ${c}`}
              />
            ))}
          </div>
          <button className={styles.item} onClick={() => onMove('up')} disabled={!canUp}>↑ Subir fila</button>
          <button className={styles.item} onClick={() => onMove('down')} disabled={!canDown}>↓ Bajar fila</button>
          <button className={styles.item} onClick={closeAfter(onClear)}>Vaciar fila</button>
          <button className={cx(styles.item, styles.danger)} onClick={closeAfter(onDelete)}>Eliminar fila</button>
        </div>
      )}
    </div>
  );
}
