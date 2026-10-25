/** Id del contenedor de imágenes sin clasificar */
export const POOL = 'pool';

export interface Item {
  id: string;
  name: string;
  url: string;
  by?: string;
}

export interface Tier {
  id: string;
  label: string;
  color: string;
  /** Intensidad del brillo de la fila: 0 (apagado) a 3 */
  glow?: number;
  items: string[];
}

export interface Room {
  code: string;
  title: string;
  tiers: Tier[];
  pool: string[];
  items: Record<string, Item>;
}

/** Alguien que hace cambios en la sala */
export interface Person {
  name: string;
  color: string;
}

export type RoomAction =
  | { type: 'item:add'; item: Item }
  | { type: 'item:move'; id: string; target: string; index?: number }
  | { type: 'item:delete'; id: string }
  | { type: 'tier:update'; id: string; label?: string; color?: string; glow?: number }
  | { type: 'tier:add'; id: string; color: string }
  | { type: 'tier:move'; id: string; dir: 'up' | 'down' }
  | { type: 'tier:clear'; id: string }
  | { type: 'tier:delete'; id: string }
  | { type: 'title:update'; title: string };

/** Una línea de la bitácora: quién hizo qué y cuándo */
export interface ActivityEntry {
  id: string;
  who: Person;
  text: string;
  at: number;
}
