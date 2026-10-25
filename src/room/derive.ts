import { newId } from '../lib/ids';
import type { Item, Room } from '../types';

/**
 * Sub-tier list: sala nueva con las mismas filas (vacías, ids nuevos) y las mismas imágenes,
 * todas en el banco en el orden visual del padre (filas de arriba a abajo y luego el banco).
 * Puro; el servidor hace lo mismo en `SalaService.Derivar`.
 */
export function deriveRoom(parent: Room, code: string, title: string): Room {
  const pool: string[] = [];
  const items: Record<string, Item> = {};
  for (const id of [...parent.tiers.flatMap(t => t.items), ...parent.pool]) {
    const item = parent.items[id];
    if (!item) continue;
    const next = newId();
    pool.push(next);
    items[next] = { ...item, id: next };
  }
  return {
    code,
    title: title.trim() || parent.title,
    tiers: parent.tiers.map(t => ({ ...t, id: newId(), items: [] })),
    pool,
    items,
    parent: parent.code,
  };
}
