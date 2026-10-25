import { useEffect, useRef, useState, type RefObject } from 'react';
import type { Presence, RemoteCursor } from '../types';
import { roomService } from './roomService';

/** Cada cuánto se manda el puntero como máximo (ms): 25 veces por segundo se ve fluido y no satura */
const CURSOR_INTERVAL = 40;

/**
 * Manda tu puntero a la sala mientras estás en línea, en px relativos a `areaRef`
 * (el tablero + banco). `dragId` es la imagen que arrastras: los demás ven una copia seguirte.
 */
export function useCursorBroadcast(code: string, areaRef: RefObject<HTMLElement | null>, enabled: boolean, dragId: string | null) {
  // Última posición conocida: al empezar/terminar un arrastre se reenvía aunque el puntero no se mueva
  const last = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let timer: number | undefined;
    let away = false;
    const flush = () => {
      timer = undefined;
      const p = last.current;
      if (p) roomService.sendCursor(code, p.x, p.y, dragId, away);
    };
    // Agrupa los movimientos: como mucho un envío cada CURSOR_INTERVAL
    const schedule = () => { timer ??= window.setTimeout(flush, CURSOR_INTERVAL); };
    const onMove = (e: PointerEvent) => {
      const rect = areaRef.current?.getBoundingClientRect();
      if (!rect) return;
      last.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      away = false;
      schedule();
    };
    const onLeave = () => { away = true; schedule(); };
    const onVisibility = () => { if (document.hidden) onLeave(); };

    window.addEventListener('pointermove', onMove);
    document.documentElement.addEventListener('pointerleave', onLeave);
    document.addEventListener('visibilitychange', onVisibility);
    if (last.current) schedule();
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('visibilitychange', onVisibility);
      clearTimeout(timer);
    };
  }, [code, areaRef, enabled, dragId]);
}

/**
 * Punteros de los demás, por conexión. Solo se muestran los de quien sigue conectado
 * (`people`); los de quien se fue se descartan al llegar la siguiente lista de presencia.
 */
export function useRemoteCursors(code: string, people: Presence[]) {
  const [cursors, setCursors] = useState<Record<string, RemoteCursor>>({});

  useEffect(() => roomService.subscribe(code, event => {
    if (event.type === 'cursor') setCursors(prev => ({ ...prev, [event.cursor.id]: event.cursor }));
    else if (event.type === 'presence') {
      const ids = new Set(event.people.map(p => p.id));
      setCursors(prev => Object.fromEntries(Object.entries(prev).filter(([id]) => ids.has(id))));
    }
  }), [code]);

  const online = new Set(people.map(p => p.id));
  return Object.values(cursors).filter(c => online.has(c.id));
}
