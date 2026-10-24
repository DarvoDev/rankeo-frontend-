import type { ActivityEntry, Room } from '../types';

const NAME_KEY = 'tierlist:nombre';
const roomKey = (code: string) => `tierlist:sala:${code}`;
const activityKey = (code: string) => `tierlist:bitacora:${code}`;

// El almacenamiento puede fallar (modo privado, cuota llena): nunca lanzamos
function storageGet(key: string) {
  try { return localStorage.getItem(key); } catch { return null; }
}
function storageSet(key: string, value: string) {
  try { localStorage.setItem(key, value); return true; } catch { return false; }
}

export function getName() { return storageGet(NAME_KEY) || ''; }
export function setName(name: string) { storageSet(NAME_KEY, name); }

export function loadRoom(code: string): Room | null {
  try { return JSON.parse(storageGet(roomKey(code)) ?? 'null'); } catch { return null; }
}
export function saveRoom(room: Room) {
  return storageSet(roomKey(room.code), JSON.stringify(room));
}

export function loadActivity(code: string): ActivityEntry[] {
  try { return JSON.parse(storageGet(activityKey(code)) ?? '[]'); } catch { return []; }
}
export function saveActivity(code: string, activity: ActivityEntry[]) {
  return storageSet(activityKey(code), JSON.stringify(activity));
}
