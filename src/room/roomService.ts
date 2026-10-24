import { DEMO_CODE, demoRoom, newRoom } from '../lib/demo';
import { generateCode, newId } from '../lib/ids';
import { loadActivity, loadRoom, saveActivity, saveRoom } from '../lib/storage';
import type { ActivityEntry, Person, Room, RoomAction } from '../types';
import { roomReducer } from './roomReducer';

export type RoomEvent =
  | { type: 'state'; room: Room }
  | { type: 'activity'; activity: ActivityEntry[] }
  | { type: 'warning'; message: string };

/** Lo que queda en la bitácora junto con un cambio */
export interface LogEntry {
  who: Person;
  text: string;
}

/**
 * Todo lo que la interfaz necesita de "el servidor".
 * Hoy lo cumple LocalRoomService (navegador + retrasos falsos); con un backend real
 * se escribe otra implementación (p. ej. con WebSockets) y los componentes no cambian.
 */
export interface RoomService {
  exists(code: string): Promise<boolean>;
  create(title: string): Promise<Room>;
  load(code: string): Promise<{ room: Room; activity: ActivityEntry[] } | null>;
  dispatch(code: string, action: RoomAction, log?: LogEntry): void;
  subscribe(code: string, listener: (event: RoomEvent) => void): () => void;
}

// Retrasos falsos para que parezca que hablamos con un servidor
const LOOKUP_DELAY = 700;
const CONNECT_DELAY = 600;
const MAX_ACTIVITY = 100;
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class LocalRoomService implements RoomService {
  private rooms = new Map<string, Room>();
  private activity = new Map<string, ActivityEntry[]>();
  private listeners = new Map<string, Set<(event: RoomEvent) => void>>();
  private warned = new Set<string>();

  private get(code: string) {
    if (!this.rooms.has(code)) {
      const stored = loadRoom(code);
      if (stored) this.rooms.set(code, stored);
    }
    return this.rooms.get(code);
  }

  async exists(code: string) {
    await wait(LOOKUP_DELAY);
    return code === DEMO_CODE || !!this.get(code);
  }

  async create(title: string) {
    await wait(LOOKUP_DELAY);
    let code;
    do code = generateCode(); while (code === DEMO_CODE || this.get(code));
    const room = newRoom(code, title);
    this.rooms.set(code, room);
    // Si no se puede guardar, la sala sigue viva en memoria mientras no recargues
    saveRoom(room);
    return room;
  }

  async load(code: string) {
    await wait(CONNECT_DELAY);
    // La sala de ejemplo siempre arranca igual; las demás se guardan en este navegador
    if (code === DEMO_CODE) {
      this.rooms.set(code, demoRoom());
      this.activity.set(code, []);
    }
    const room = this.get(code);
    if (!room) return null;
    if (!this.activity.has(code)) this.activity.set(code, loadActivity(code));
    return { room, activity: this.activity.get(code)! };
  }

  dispatch(code: string, action: RoomAction, log?: LogEntry) {
    const room = this.rooms.get(code);
    if (!room) return;
    const next = roomReducer(room, action);
    if (next === room) return;
    this.rooms.set(code, next);
    this.emit(code, { type: 'state', room: next });

    let activity = this.activity.get(code) ?? [];
    if (log) {
      activity = [{ id: newId(), at: Date.now(), ...log }, ...activity].slice(0, MAX_ACTIVITY);
      this.activity.set(code, activity);
      this.emit(code, { type: 'activity', activity });
    }

    if (code === DEMO_CODE) return;
    const saved = saveRoom(next) && (!log || saveActivity(code, activity));
    if (!saved && !this.warned.has(code)) {
      this.warned.add(code);
      this.emit(code, { type: 'warning', message: 'No se pudo guardar en el navegador: los cambios se perderán al recargar.' });
    }
  }

  subscribe(code: string, listener: (event: RoomEvent) => void) {
    if (!this.listeners.has(code)) this.listeners.set(code, new Set());
    this.listeners.get(code)!.add(listener);
    return () => { this.listeners.get(code)?.delete(listener); };
  }

  private emit(code: string, event: RoomEvent) {
    this.listeners.get(code)?.forEach(listener => listener(event));
  }
}

export const roomService: RoomService = new LocalRoomService();
