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

/** Texto del tooltip nativo: nombre, subtítulo y quién la subió */
function tooltip(item: Item) {
  const parts = [item.name];
  if (item.caption) parts.push(item.caption);
  if (item.by) parts.push(`subida por ${item.by}`);
  return `${parts.join(' · ')} (doble clic para ampliar)`;
}

export function ItemCard({ item, placeholder, overlay, ref, className, ...rest }: ItemCardProps) {
  return (
    <div
      ref={ref}
      className={cx(styles.item, placeholder && styles.placeholder, overlay && styles.overlay, className)}
      title={tooltip(item)}
      {...rest}
    >
      {/* crossOrigin: las imágenes de la API vienen de otro origen y el PNG las necesita sin "tainted" */}
      <img src={item.url} alt={item.name} draggable={false} crossOrigin="anonymous" />
      {/* Subtítulo al pasar el cursor; invisible en el PNG (opacidad 0 sin hover) */}
      {item.caption && !placeholder && !overlay && <span className={styles.caption}>{item.caption}</span>}
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
      <Modal title={item.name} onClose={() => setZoomed(false)} className={styles.zoom}>
        <img src={item.url} alt={item.name} />
        {(item.caption || item.by) && (
          <p className={styles.zoomMeta}>
            {item.caption && <span>{item.caption}</span>}
            {item.by && <small>subida por {item.by}</small>}
          </p>
        )}
      </Modal>,
      document.body,
    )}
    </>
  );
}
