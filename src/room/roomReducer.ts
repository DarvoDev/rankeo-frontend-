import { MAX_TIERS } from '../lib/demo';
import { POOL, type Room, type RoomAction } from '../types';

export function listOf(room: Room, container: string): string[] | undefined {
  if (container === POOL) return room.pool;
  return room.tiers.find(t => t.id === container)?.items;
}

/** Fila (o banco) donde está una imagen */
export function containerOf(room: Room, id: string): string | undefined {
  if (room.pool.includes(id)) return POOL;
  return room.tiers.find(t => t.items.includes(id))?.id;
}

function updateList(room: Room, container: string, fn: (list: string[]) => string[]): Room {
  if (container === POOL) return { ...room, pool: fn(room.pool) };
  return { ...room, tiers: room.tiers.map(t => t.id === container ? { ...t, items: fn(t.items) } : t) };
}

function detach(room: Room, id: string): Room {
  return {
    ...room,
    pool: room.pool.filter(x => x !== id),
    tiers: room.tiers.map(t => t.items.includes(id) ? { ...t, items: t.items.filter(x => x !== id) } : t),
  };
}

/**
 * Todos los cambios de una sala, vengan de ti o de otro usuario.
 * Es puro: devuelve la misma sala si la acción no aplica.
 */
export function roomReducer(room: Room, action: RoomAction): Room {
  switch (action.type) {
    case 'item:add':
      if (room.items[action.item.id]) return room;
      return { ...room, items: { ...room.items, [action.item.id]: action.item }, pool: [...room.pool, action.item.id] };

    case 'item:move': {
      if (!room.items[action.id] || !listOf(room, action.target)) return room;
      return updateList(detach(room, action.id), action.target, list => {
        const i = Math.max(0, Math.min(action.index ?? list.length, list.length));
        return [...list.slice(0, i), action.id, ...list.slice(i)];
      });
    }

    case 'item:delete': {
      if (!room.items[action.id]) return room;
      const items = { ...room.items };
      delete items[action.id];
      return { ...detach(room, action.id), items };
    }

    case 'tier:update':
      if (!room.tiers.some(t => t.id === action.id)) return room;
      return {
        ...room,
        tiers: room.tiers.map(t => t.id !== action.id ? t : {
          ...t,
          label: action.label ?? t.label,
          color: action.color ?? t.color,
          glow: action.glow ?? t.glow,
        }),
      };

    case 'tier:add':
      if (room.tiers.length >= MAX_TIERS) return room;
      return { ...room, tiers: [...room.tiers, { id: action.id, label: 'Nuevo', color: action.color, items: [] }] };

    case 'tier:move': {
      const i = room.tiers.findIndex(t => t.id === action.id);
      const j = i + (action.dir === 'up' ? -1 : 1);
      if (i === -1 || j < 0 || j >= room.tiers.length) return room;
      const tiers = [...room.tiers];
      [tiers[i], tiers[j]] = [tiers[j], tiers[i]];
      return { ...room, tiers };
    }

    case 'tier:clear': {
      const tier = room.tiers.find(t => t.id === action.id);
      if (!tier || !tier.items.length) return room;
      return {
        ...room,
        pool: [...room.pool, ...tier.items],
        tiers: room.tiers.map(t => t.id === action.id ? { ...t, items: [] } : t),
      };
    }

    case 'tier:delete': {
      const tier = room.tiers.find(t => t.id === action.id);
      if (!tier || room.tiers.length <= 1) return room;
      return { ...room, pool: [...room.pool, ...tier.items], tiers: room.tiers.filter(t => t.id !== action.id) };
    }

    case 'title:update':
      return { ...room, title: action.title };
  }
}
