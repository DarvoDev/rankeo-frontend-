import { describe, expect, it } from 'vitest';
import { newRoom } from '../lib/demo';
import { POOL, type Item, type Room } from '../types';
import { containerOf, roomReducer } from './roomReducer';

const item = (id: string): Item => ({ id, name: id, url: '' });

function roomWith(...ids: string[]): Room {
  return ids.reduce((room, id) => roomReducer(room, { type: 'item:add', item: item(id) }), newRoom('TEST01'));
}

describe('roomReducer', () => {
  it('las imágenes nuevas llegan al banco', () => {
    const room = roomWith('a', 'b');
    expect(room.pool).toEqual(['a', 'b']);
    expect(Object.keys(room.items)).toEqual(['a', 'b']);
  });

  it('mueve una imagen a otra fila en la posición indicada', () => {
    let room = roomWith('a', 'b', 'c');
    const s = room.tiers[0].id;
    room = roomReducer(room, { type: 'item:move', id: 'a', target: s, index: 0 });
    room = roomReducer(room, { type: 'item:move', id: 'c', target: s, index: 0 });
    expect(room.tiers[0].items).toEqual(['c', 'a']);
    expect(room.pool).toEqual(['b']);
    expect(containerOf(room, 'a')).toBe(s);
  });

  it('reordena dentro de la misma fila', () => {
    let room = roomWith('a', 'b', 'c');
    room = roomReducer(room, { type: 'item:move', id: 'a', target: POOL, index: 2 });
    expect(room.pool).toEqual(['b', 'c', 'a']);
  });

  it('ignora movimientos a filas o imágenes que no existen', () => {
    const room = roomWith('a');
    expect(roomReducer(room, { type: 'item:move', id: 'a', target: 'nope' })).toBe(room);
    expect(roomReducer(room, { type: 'item:move', id: 'zzz', target: POOL })).toBe(room);
  });

  it('borrar una fila devuelve sus imágenes al banco', () => {
    let room = roomWith('a', 'b');
    const s = room.tiers[0].id;
    room = roomReducer(room, { type: 'item:move', id: 'a', target: s });
    room = roomReducer(room, { type: 'tier:delete', id: s });
    expect(room.tiers).toHaveLength(4);
    expect(room.pool).toEqual(['b', 'a']);
  });

  it('no deja borrar la última fila', () => {
    let room = newRoom('TEST01');
    for (const t of room.tiers.slice(1)) room = roomReducer(room, { type: 'tier:delete', id: t.id });
    expect(room.tiers).toHaveLength(1);
    expect(roomReducer(room, { type: 'tier:delete', id: room.tiers[0].id })).toBe(room);
  });

  it('vaciar una fila manda todo al banco', () => {
    let room = roomWith('a', 'b');
    const s = room.tiers[0].id;
    room = roomReducer(room, { type: 'item:move', id: 'a', target: s });
    room = roomReducer(room, { type: 'item:move', id: 'b', target: s });
    room = roomReducer(room, { type: 'tier:clear', id: s });
    expect(room.tiers[0].items).toEqual([]);
    expect(room.pool).toEqual(['a', 'b']);
  });

  it('eliminar una imagen la quita de su fila y del índice', () => {
    let room = roomWith('a');
    room = roomReducer(room, { type: 'item:delete', id: 'a' });
    expect(room.pool).toEqual([]);
    expect(room.items).toEqual({});
  });

  it('sube y baja filas sin salirse de los bordes', () => {
    let room = newRoom('TEST01');
    const [s, a] = room.tiers;
    expect(roomReducer(room, { type: 'tier:move', id: s.id, dir: 'up' })).toBe(room);
    room = roomReducer(room, { type: 'tier:move', id: s.id, dir: 'down' });
    expect(room.tiers.slice(0, 2).map(t => t.id)).toEqual([a.id, s.id]);
  });
});
