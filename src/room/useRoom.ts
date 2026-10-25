import { useCallback, useEffect, useMemo, useState } from 'react';
import { useToast } from '../components/ui/toastContext';
import { colorFor } from '../lib/ids';
import type { ActivityEntry, Person, Presence, Room, RoomAction } from '../types';
import { roomService } from './roomService';

export type RoomStatus = 'connecting' | 'online' | 'missing';

/** Estado de una sala: contenido, bitácora de movimientos y quién está conectado */
export function useRoom(code: string, myName: string) {
  const toast = useToast();
  const [room, setRoom] = useState<Room | null>(null);
  const [status, setStatus] = useState<RoomStatus>('connecting');
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  // Hasta que el servidor mande la lista (o si la sala es local, siempre) solo estás tú
  const [people, setPeople] = useState<Presence[]>([]);

  const me = useMemo<Person>(() => ({ name: myName, color: colorFor(myName) }), [myName]);
  const shownPeople = useMemo<Presence[]>(() => people.length ? people : [{ ...me, id: 'me', me: true }], [people, me]);

  useEffect(() => {
    let cancelled = false;
    const unsubscribe = roomService.subscribe(code, event => {
      if (event.type === 'state') setRoom(event.room);
      else if (event.type === 'activity') setActivity(event.activity);
      else if (event.type === 'online') setStatus(event.online ? 'online' : 'connecting');
      else if (event.type === 'presence') setPeople(event.people);
      else if (event.type === 'warning') toast(event.message);
      // 'cursor' lo consume CursorLayer por su cuenta: cambia muy seguido para pasar por aquí
    });
    let retry: number | undefined;
    const load = (first: boolean) => roomService.load(code).then(loaded => {
      if (cancelled) return;
      setRoom(loaded?.room ?? null);
      setActivity(loaded?.activity ?? []);
      setStatus(loaded ? 'online' : 'missing');
    }, () => {
      if (cancelled) return;
      if (first) toast('No se pudo conectar con la sala.');
      // Sin conexión (API caída o sin red): reintenta hasta que responda
      retry = window.setTimeout(() => load(false), 3000);
    });
    load(true);
    return () => { cancelled = true; clearTimeout(retry); unsubscribe(); };
  }, [code, toast]);

  /** Aplica un cambio tuyo; con texto queda en la bitácora a tu nombre */
  const dispatch = useCallback((action: RoomAction, text?: string) => {
    roomService.dispatch(code, action, text ? { who: me, text } : undefined);
  }, [code, me]);

  return { room, status, activity, people: shownPeople, dispatch };
}
