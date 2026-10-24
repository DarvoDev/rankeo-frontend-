import type { Item, Room } from '../types';
import { newId } from './ids';

export const DEMO_CODE = 'DEMO42';
export const MAX_TIERS = 15;

export const TIER_COLORS = ['#c96063', '#dba06d', '#dcc86c', '#89d07a', '#74bdd6', '#9a8ad6',
                            '#d68ac4', '#e88b5a', '#a0a0a0', '#5fbfa8', '#f0e68c', '#ffffff'];

export function newRoom(code: string, title?: string): Room {
  return {
    code,
    title: title || 'Mi Tier List',
    tiers: ['S', 'A', 'B', 'C', 'D'].map((label, i) => ({ id: newId(), label, color: TIER_COLORS[i], items: [] })),
    pool: [],
    items: {},
  };
}

/* ---------- Contenido de la sala de ejemplo ---------- */
const DEMO_CARDS: [emoji: string, label: string][] = [
  ['🍕', 'Pizza'], ['🌮', 'Tacos'], ['🍣', 'Sushi'], ['🍔', 'Hamburguesa'],
  ['🍜', 'Ramen'], ['🥗', 'Ensalada'], ['🍩', 'Dona'], ['🌭', 'Hot dog'],
  ['🥞', 'Hot cakes'], ['🍦', 'Helado'], ['🥐', 'Croissant'], ['🌯', 'Burrito'],
  ['🥟', 'Gyoza'], ['🧇', 'Waffle'], ['🍗', 'Pollo frito'], ['🥘', 'Paella'],
];

/** Imagen de relleno: tarjeta SVG con emoji y nombre */
function cardImage(emoji: string, label: string, hue: number) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="hsl(${hue} 55% 45%)"/><stop offset="1" stop-color="hsl(${(hue + 40) % 360} 60% 28%)"/>
</linearGradient></defs>
<rect width="256" height="256" fill="url(#g)"/>
<text x="128" y="120" font-size="110" text-anchor="middle" dominant-baseline="middle">${emoji}</text>
<text x="128" y="226" font-size="28" font-family="system-ui, sans-serif" font-weight="700" fill="#fff" text-anchor="middle">${label}</text>
</svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

function makeCardItem(index: number): Item {
  const [emoji, label] = DEMO_CARDS[index];
  return { id: newId(), name: `${emoji} ${label}`, url: cardImage(emoji, label, (index * 47) % 360) };
}

/** Sala de ejemplo con contenido ya acomodado */
export function demoRoom(): Room {
  const room = newRoom(DEMO_CODE, 'Comida favorita del grupo');
  const layout: [card: number, tier: string | null][] = [
    [0, 'S'], [2, 'S'], [1, 'A'], [4, 'A'], [3, 'B'], [11, 'B'], [5, 'C'], [7, 'D'], [6, null], [9, null],
  ];
  layout.forEach(([card, tier]) => {
    const item = makeCardItem(card);
    room.items[item.id] = item;
    (tier ? room.tiers.find(t => t.label === tier)!.items : room.pool).push(item.id);
  });
  return room;
}
