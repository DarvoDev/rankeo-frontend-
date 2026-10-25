import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { HTMLAttributes, Ref } from 'react';
import { cx } from '../../lib/cx';
import type { Item } from '../../types';
import styles from './ItemCard.module.css';

interface ItemCardProps extends HTMLAttributes<HTMLDivElement> {
  item: Item;
  /** Hueco que deja la imagen mientras la arrastras */
  placeholder?: boolean;
  /** Copia que sigue al puntero */
  overlay?: boolean;
  ref?: Ref<HTMLDivElement>;
}

export function ItemCard({ item, placeholder, overlay, ref, className, ...rest }: ItemCardProps) {
  return (
    <div
      ref={ref}
      className={cx(styles.item, placeholder && styles.placeholder, overlay && styles.overlay, className)}
      title={item.by ? `${item.name} · subida por ${item.by}` : item.name}
      {...rest}
    >
      {/* crossOrigin: las imágenes de la API vienen de otro origen y el PNG las necesita sin "tainted" */}
      <img src={item.url} alt={item.name} draggable={false} crossOrigin="anonymous" />
    </div>
  );
}

export function SortableItem({ item }: { item: Item }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    attributes: { roleDescription: 'imagen arrastrable' },
  });
  return (
    <ItemCard
      ref={setNodeRef}
      data-item-id={item.id}
      item={item}
      placeholder={isDragging}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      {...attributes}
      {...listeners}
    />
  );
}
