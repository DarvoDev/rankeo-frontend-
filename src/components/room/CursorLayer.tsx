import { useRemoteCursors } from '../../room/useCursors';
import { EXPORT_IGNORE } from '../../lib/exportPng';
import type { Item, Presence } from '../../types';
import { ItemCard } from './ItemCard';
import styles from './CursorLayer.module.css';

interface Props {
  code: string;
  people: Presence[];
  items: Record<string, Item>;
}

/**
 * Punteros de los demás sobre el tablero (y la imagen que arrastran, si alguna).
 * Va dentro de un contenedor `position: relative`; no recibe eventos del ratón.
 */
export function CursorLayer({ code, people, items }: Props) {
  const cursors = useRemoteCursors(code, people);
  return (
    <div className={styles.layer} aria-hidden="true" {...{ [EXPORT_IGNORE]: '' }}>
      {cursors.map(c => !c.away && (
        <div key={c.id} className={styles.cursor} style={{ transform: `translate(${c.x}px, ${c.y}px)` }}>
          {c.dragId && items[c.dragId] && (
            <ItemCard item={items[c.dragId]} className={styles.ghost} style={{ outlineColor: c.color }} />
          )}
          <svg className={styles.arrow} width="18" height="22" viewBox="0 0 18 22">
            <path d="M1 1 L1 17 L5.5 12.5 L8.5 20 L11.5 18.5 L8.5 11.5 L15 11.5 Z" fill={c.color} stroke="#111" strokeWidth="1.2" strokeLinejoin="round" />
          </svg>
          <span className={styles.name} style={{ background: c.color }}>{c.name}</span>
        </div>
      ))}
    </div>
  );
}
