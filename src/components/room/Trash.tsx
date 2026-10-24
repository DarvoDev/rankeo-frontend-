import { useDroppable } from '@dnd-kit/core';
import { cx } from '../../lib/cx';
import styles from './Trash.module.css';

export const TRASH = 'trash';

/** Papelera que aparece abajo mientras arrastras una imagen con ratón o dedo */
export function Trash({ visible }: { visible: boolean }) {
  // Desactivada no participa en colisiones (ni atrae las flechas del teclado)
  const { setNodeRef, isOver } = useDroppable({ id: TRASH, disabled: !visible });
  return (
    <div ref={setNodeRef} className={cx(styles.trash, visible && styles.visible, isOver && styles.over)} aria-hidden={!visible}>
      🗑 Suelta aquí para eliminar
    </div>
  );
}
