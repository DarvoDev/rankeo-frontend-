import { HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { getName } from '../lib/storage';
import type { ActivityEntry, Presence, RemoteCursor, Room, RoomAction } from '../types';
import { roomReducer } from './roomReducer';
import type { RoomEvent, RoomService } from './roomService';

const API = String(import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

/** El servidor manda la sala con `version`: sube con cada cambio aplicado */
type ServerRoom = Room & { version: number };

// Las URLs de imagen llegan relativas (/imagenes/...): se completan aquí, en un solo punto
function withApi(room: ServerRoom): ServerRoom {
  const items = Object.fromEntries(Object.entries(room.items).map(([id, item]) =>
    [id, item.url.startsWith('/') ? { ...item, url: API + item.url } : item]));
  return { ...room, items };
}

/** Mensaje de un HubException (el cliente lo recibe envuelto en otro texto) */
function hubMessage(error: unknown) {
  return String((error as Error)?.message ?? '').split('HubException: ')[1];
}

async function problem(res: Response, fallback: string): Promise<never> {
  const detail = await res.json().then(p => p.detail, () => undefined);
  throw new Error(detail ?? fallback);
}

/**
 * Salas compartidas en vivo con la API (HTTP + SignalR).
 * Los cambios propios se aplican al instante con el mismo reducer (optimista) y el estado
 * que manda el servidor los reemplaza; si el servidor los rechaza se vuelve al último confirmado.
 * Presencia y cursores son efímeros: los manda el servidor a quien esté conectado y no se guardan.
 */
export class SignalRRoomService implements RoomService {
  // Reintenta para siempre (cada 2, 4… hasta 10 s): con el default se rinde a los ~40 s y la pestaña queda muerta
  private conn = new HubConnectionBuilder().withUrl(`${API}/hubs/sala`)
    .withAutomaticReconnect({ nextRetryDelayInMilliseconds: ({ previousRetryCount }) => Math.min(previousRetryCount * 2000, 10000) })
    .build();
  private starting?: Promise<void>;
  private joined?: string;
  // Sala a la que se está uniendo: `presence` llega antes de que `Unirse` devuelva
  private joining?: string;
  private shown = new Map<string, Room>();
  private confirmed = new Map<string, ServerRoom>();
  private listeners = new Map<string, Set<(event: RoomEvent) => void>>();

  constructor() {
    this.conn.on('state', (room: ServerRoom) => this.receive(room));
    this.conn.on('activity', (activity: ActivityEntry[]) => {
      if (this.joined) this.emit(this.joined, { type: 'activity', activity });
    });
    this.conn.on('presence', (people: Presence[]) => {
      const code = this.joining ?? this.joined;
      if (code) this.emit(code, { type: 'presence', people: people.map(p => ({ ...p, me: p.id === this.conn.connectionId })) });
    });
    this.conn.on('cursor', (cursor: RemoteCursor) => {
      if (this.joined) this.emit(this.joined, { type: 'cursor', cursor });
    });
    this.conn.onreconnecting(() => {
      if (this.joined) this.emit(this.joined, { type: 'online', online: false });
    });
    // Los grupos de SignalR no sobreviven a la reconexión: hay que volver a unirse
    this.conn.onreconnected(() => {
      const code = this.joined;
      if (!code) return;
      this.join(code).then(({ room, activity }) => {
        this.emit(code, { type: 'state', room });
        this.emit(code, { type: 'activity', activity });
        this.emit(code, { type: 'online', online: true });
      }, () => this.emit(code, { type: 'warning', message: 'No se pudo reconectar con la sala.' }));
    });
  }

  async exists(code: string) {
    const res = await fetch(`${API}/api/salas/${code}`);
    if (res.status === 404) return false;
    if (!res.ok) return problem(res, 'No se pudo buscar la sala.');
    return true;
  }

  async create(title: string) {
    const res = await fetch(`${API}/api/salas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    if (!res.ok) return problem(res, 'No se pudo crear la sala.');
    return withApi(await res.json());
  }

  async derive(code: string, title: string, by: string) {
    const res = await fetch(`${API}/api/salas/${code}/derivadas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, apodo: by }),
    });
    if (!res.ok) return problem(res, 'No se pudo crear la sub-tier list.');
    return withApi(await res.json());
  }

  async load(code: string) {
    try {
      return await this.join(code);
    } catch (error) {
      // Error de regla (sala inexistente, apodo inválido) → "no existe"; el resto es de red
      if (hubMessage(error)) return null;
      throw error;
    }
  }

  dispatch(code: string, action: RoomAction) {
    // El texto de la bitácora lo arma el servidor; las imágenes van por addImage
    const room = this.shown.get(code);
    if (!room || action.type === 'item:add') return;
    const next = roomReducer(room, action);
    if (next === room) return;
    this.show(code, next);
    this.conn.invoke('Despachar', action).catch(error => {
      const confirmed = this.confirmed.get(code);
      if (confirmed) this.show(code, confirmed);
      this.emit(code, { type: 'warning', message: hubMessage(error) ?? 'No se pudo guardar el cambio.' });
    });
  }

  async addImage(code: string, dataUrl: string, name: string, by: string, caption?: string) {
    const form = new FormData();
    form.append('archivo', await (await fetch(dataUrl)).blob(), `${name}.webp`);
    form.append('nombre', name);
    form.append('apodo', by);
    if (caption) form.append('subtitulo', caption);
    const res = await fetch(`${API}/api/salas/${code}/imagenes`, { method: 'POST', body: form });
    // La imagen nueva llega a todos (también a ti) por el evento `state`
    if (!res.ok) await problem(res, `No se pudo subir ${name}.`);
  }

  sendCursor(code: string, x: number, y: number, dragId: string | null, away: boolean) {
    if (this.joined !== code || this.conn.state !== HubConnectionState.Connected) return;
    // send (sin respuesta): si se pierde uno, el siguiente lo corrige
    this.conn.send('Cursor', x, y, dragId, away).catch(() => {});
  }

  subscribe(code: string, listener: (event: RoomEvent) => void) {
    if (!this.listeners.has(code)) this.listeners.set(code, new Set());
    this.listeners.get(code)!.add(listener);
    return () => { this.listeners.get(code)?.delete(listener); };
  }

  private async join(code: string) {
    if (this.conn.state === HubConnectionState.Disconnected) {
      await (this.starting ??= this.conn.start().finally(() => { this.starting = undefined; }));
    } else await this.starting;
    this.joining = code;
    try {
      const { room, activity } = await this.conn.invoke<{ room: ServerRoom; activity: ActivityEntry[] }>('Unirse', code, getName());
      this.joined = room.code;
      this.confirmed.delete(room.code);
      this.receive(room, false);
      return { room: this.shown.get(room.code)!, activity };
    } finally {
      this.joining = undefined;
    }
  }

  // Con escrituras simultáneas los estados pueden llegar desordenados: se descartan los viejos
  private receive(raw: ServerRoom, notify = true) {
    const current = this.confirmed.get(raw.code);
    if (current && raw.version < current.version) return;
    const room = withApi(raw);
    this.confirmed.set(room.code, room);
    if (notify) this.show(room.code, room);
    else this.shown.set(room.code, room);
  }

  private show(code: string, room: Room) {
    this.shown.set(code, room);
    this.emit(code, { type: 'state', room });
  }

  private emit(code: string, event: RoomEvent) {
    this.listeners.get(code)?.forEach(listener => listener(event));
  }
}
