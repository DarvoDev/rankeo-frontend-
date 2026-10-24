export const newId = () => Math.random().toString(36).slice(2, 10);

export function pick<T>(list: ArrayLike<T>): T {
  return list[Math.floor(Math.random() * list.length)];
}

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sin 0/O ni 1/I

export function generateCode() {
  return Array.from({ length: 6 }, () => pick(CODE_ALPHABET)).join('');
}

export function normalizeCode(code: string | null | undefined) {
  return String(code ?? '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

/** Color estable a partir de un texto (para los avatares) */
export function colorFor(text: string) {
  let h = 0;
  for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return `hsl(${h} 60% 70%)`;
}
