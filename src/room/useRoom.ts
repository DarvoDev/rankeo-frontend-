import { useCallback, useEffect, useMemo, useState } from 'react';
import { useToast } from '../components/ui/toastContext';
import { colorFor } from '../lib/ids';
import type { ActivityEntry, Person, Room, RoomAction } from '../types';
import { roomService } from './roomService';

export type RoomStatus = 'connecting' | 'online' | 'missing';

/** Estado de una sala: contenido y bitácora de movimientos */
export function useRoom(code: string, myName: string) {
  const toast = useToast();
  const [room, setRoom] = useState<Room | null>(null);
  const [status, setStatus] = useState<RoomStatus>('connecting');
  const [activity, setActivity] = useState<ActivityEntry[]>([]);

  const me = useMemo<Person>(() => ({ name: myName, color: colorFor(myName) }), [myName]);

  useEffect(() => {
    let cancelled = false;
    const unsubscribe = roomService.subscribe(code, event => {
      if (event.type === 'state') setRoom(event.room);
      else if (event.type === 'activity') setActivity(event.activity);
      else toast(event.message);
    });
    roomService.load(code).then(loaded => {
      if (cancelled) return;
      setRoom(loaded?.room ?? null);
      setActivity(loaded?.activity ?? []);
      setStatus(loaded ? 'online' : 'missing');
    }, () => { if (!cancelled) toast('No se pudo conectar con la sala.'); });
    return () => { cancelled = true; unsubscribe(); };
  }, [code, toast]);

  /** Aplica un cambio tuyo; con texto queda en la bitácora a tu nombre */
  const dispatch = useCallback((action: RoomAction, text?: string) => {
    roomService.dispatch(code, action, text ? { who: me, text } : undefined);
  }, [code, me]);

  return { room, status, activity, dispatch };
}
