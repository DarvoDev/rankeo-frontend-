import { useDroppable } from '@dnd-kit/core';
import { rectSortingStrategy, SortableContext } from '@dnd-kit/sortable';
import { cx } from '../../lib/cx';
import type { Item } from '../../types';
import styles from './DropZone.module.css';
import { SortableItem } from './ItemCard';

interface Props {
  /** Id del contenedor: id de la fila o POOL */
  id: string;
  ids: string[];
  items: Record<string, Item>;
  className?: string;
  emptyText?: string;
}

/** Zona donde se acomodan y reordenan imágenes (una fila o el banco) */
export function DropZone({ id, ids, items, className, emptyText }: Props) {
  const { setNodeRef } = useDroppable({ id });
  return (
    <SortableContext id={id} items={ids} strategy={rectSortingStrategy}>
      <div ref={setNodeRef} className={cx(styles.zone, className)} data-empty={emptyText}>
        {ids.map(itemId => items[itemId] && (
          <SortableItem key={itemId} item={items[itemId]} />
        ))}
      </div>
    </SortableContext>
  );
}
