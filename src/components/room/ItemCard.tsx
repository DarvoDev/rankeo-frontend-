import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState, type HTMLAttributes, type Ref } from 'react';
import { createPortal } from 'react-dom';
import { cx } from '../../lib/cx';
import { Modal } from '../ui/Modal';
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
      title={`${item.by ? `${item.name} · subida por ${item.by}` : item.name} (doble clic para ampliar)`}
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
  const [zoomed, setZoomed] = useState(false);
  return (
    <>
    <ItemCard
      ref={setNodeRef}
      data-item-id={item.id}
      item={item}
      placeholder={isDragging}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      onDoubleClick={() => setZoomed(true)}
      {...attributes}
      {...listeners}
    />
    {/* Portal: el transform de dnd-kit rompería el position: fixed del modal */}
    {zoomed && createPortal(
      <Modal title={item.by ? `${item.name} · ${item.by}` : item.name} onClose={() => setZoomed(false)} className={styles.zoom}>
        <img src={item.url} alt={item.name} />
      </Modal>,
      document.body,
    )}
    </>
  );
}
