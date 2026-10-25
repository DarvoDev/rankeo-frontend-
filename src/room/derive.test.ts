import { describe, expect, it } from 'vitest';
import { newRoom } from '../lib/demo';
import { type Item, type Room } from '../types';
import { deriveRoom } from './derive';
import { roomReducer } from './roomReducer';

const item = (id: string, caption?: string): Item => ({ id, name: id, url: `/x/${id}`, by: 'Ana', caption });

function roomWith(...ids: string[]): Room {
  return ids.reduce((room, id) => roomReducer(room, { type: 'item:add', item: item(id, `sub ${id}`) }), newRoom('TEST01', 'Pelis'));
}

describe('deriveRoom', () => {
  it('copia filas vacías con ids nuevos y manda todas las imágenes al banco', () => {
    let parent = roomWith('a', 'b', 'c');
    const [s, a] = parent.tiers;
    parent = roomReducer(parent, { type: 'item:move', id: 'c', target: s.id });
    parent = roomReducer(parent, { type: 'item:move', id: 'a', target: a.id });
    parent = roomReducer(parent, { type: 'tier:update', id: s.id, label: 'Top', glow: 3 });

    const child = deriveRoom(parent, 'NEW001', '');

    expect(child.code).toBe('NEW001');
    expect(child.parent).toBe('TEST01');
    expect(child.title).toBe('Pelis');
    expect(child.tiers.map(t => t.label)).toEqual(['Top', 'A', 'B', 'C', 'D']);
    expect(child.tiers[0].glow).toBe(3);
    expect(child.tiers.every(t => t.items.length === 0)).toBe(true);
    expect(child.tiers.map(t => t.id)).not.toContain(s.id);

    // Orden visual del padre: fila S, fila A, banco. Ids nuevos, datos iguales.
    expect(child.pool.map(id => child.items[id].name)).toEqual(['c', 'a', 'b']);
    expect(child.pool).not.toContain('a');
    expect(child.items[child.pool[0]]).toMatchObject({ caption: 'sub c', by: 'Ana', url: '/x/c' });
    expect(Object.keys(child.items)).toEqual(child.pool);
  });

  it('usa el título dado y no toca al padre', () => {
    const parent = roomWith('a');
    const child = deriveRoom(parent, 'NEW001', '  Pelis 2 ');
    expect(child.title).toBe('Pelis 2');
    expect(parent.pool).toEqual(['a']);
    expect(parent.parent).toBeUndefined();
  });
});
