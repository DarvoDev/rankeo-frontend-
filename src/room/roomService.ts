import { DEMO_CODE, demoRoom, newRoom } from '../lib/demo';
import { colorFor, generateCode, newId } from '../lib/ids';
import { loadActivity, loadRoom, saveActivity, saveRoom } from '../lib/storage';
import type { ActivityEntry, Person, Presence, RemoteCursor, Room, RoomAction } from '../types';
import { deriveRoom } from './derive';
import { roomReducer } from './roomReducer';
import { SignalRRoomService } from './signalrRoomService';

export type RoomEvent =
  | { type: 'state'; room: Room }
  | { type: 'activity'; activity: ActivityEntry[] }
  | { type: 'warning'; message: string }
  | { type: 'online'; online: boolean }
  /** Quién está conectado ahora (lista completa cada vez) */
  | { type: 'presence'; people: Presence[] }
  /** El puntero de otra persona se movió */
  | { type: 'cursor'; cursor: RemoteCursor };

/** Lo que queda en la bitácora junto con un cambio */
export interface LogEntry {
  who: Person;
  text: string;
}

/**
 * Todo lo que la interfaz necesita de "el servidor".
 * La cumplen LocalRoomService (navegador + retrasos falsos, solo para DEMO42) y
 * SignalRRoomService (API real); los componentes no saben cuál es cuál.
 */
export interface RoomService {
  exists(code: string): Promise<boolean>;
  create(title: string): Promise<Room>;
  /** Sub-tier list: sala nueva con las mismas filas e imágenes de `code`, todas sin clasificar */
  derive(code: string, title: string, by: string): Promise<Room>;
  load(code: string): Promise<{ room: Room; activity: ActivityEntry[] } | null>;
  dispatch(code: string, action: RoomAction, log?: LogEntry): void;
  /** Agrega una imagen (data URL ya recortada) al final del banco */
  addImage(code: string, dataUrl: string, name: string, by: string, caption?: string): Promise<void>;
  /** Tu puntero para los demás (px relativos al tablero). Efímero: si no hay conexión se descarta */
  sendCursor(code: string, x: number, y: number, dragId: string | null, away: boolean): void;
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

  async derive(code: string, title: string, by: string) {
    await wait(LOOKUP_DELAY);
    const parent = this.get(code);
    if (!parent) throw new Error(`No existe ninguna sala con el código ${code}.`);
    let next;
    do next = generateCode(); while (next === DEMO_CODE || this.get(next));
    const room = deriveRoom(parent, next, title);
    const activity = [{ id: newId(), at: Date.now(), who: { name: by, color: colorFor(by) }, text: `creó esta sala a partir de ${code}` }];
    this.rooms.set(next, room);
    this.activity.set(next, activity);
    if (saveRoom(room)) saveActivity(next, activity);
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

  async addImage(code: string, dataUrl: string, name: string, by: string, caption?: string) {
    const item = { id: newId(), name, url: dataUrl, by, ...(caption ? { caption } : {}) };
    this.dispatch(code, { type: 'item:add', item }, { who: { name: by, color: colorFor(by) }, text: `subió ${name}` });
  }

  // Sin otros usuarios en el navegador: no hay a quién mandarle el puntero
  sendCursor() {}

  subscribe(code: string, listener: (event: RoomEvent) => void) {
    if (!this.listeners.has(code)) this.listeners.set(code, new Set());
    this.listeners.get(code)!.add(listener);
    return () => { this.listeners.get(code)?.delete(listener); };
  }

  private emit(code: string, event: RoomEvent) {
    this.listeners.get(code)?.forEach(listener => listener(event));
  }
}

const local = new LocalRoomService();
const remote = new SignalRRoomService();
// DEMO42 vive solo en el navegador (cada visitante tiene su copia); las demás salas, en la API
const pick = (code: string) => code === DEMO_CODE ? local : remote;

export const roomService: RoomService = {
  exists: code => pick(code).exists(code),
  create: title => remote.create(title),
  // De DEMO42 no se puede derivar: sus imágenes no existen en el servidor y la sala nueva viviría en la API
  derive: (code, title, by) => code === DEMO_CODE
    ? Promise.reject(new Error('La sala de ejemplo no se puede derivar.'))
    : remote.derive(code, title, by),
  load: code => pick(code).load(code),
  dispatch: (code, action, log) => pick(code).dispatch(code, action, log),
  addImage: (code, dataUrl, name, by, caption) => pick(code).addImage(code, dataUrl, name, by, caption),
  sendCursor: (code, x, y, dragId, away) => pick(code).sendCursor(code, x, y, dragId, away),
  subscribe: (code, listener) => pick(code).subscribe(code, listener),
};
