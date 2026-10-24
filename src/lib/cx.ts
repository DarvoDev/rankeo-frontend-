/** Une clases CSS ignorando las vacías: cx(a, cond && b) */
export const cx = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(' ');
