/** Elementos con este atributo no salen en el PNG (p. ej. los botones ⚙ de cada fila) */
export const EXPORT_IGNORE = 'data-export-ignore';

export async function exportPng(element: HTMLElement, filename: string) {
  // html2canvas pesa bastante: se descarga solo cuando alguien exporta
  const { default: html2canvas } = await import('html2canvas');
  const canvas = await html2canvas(element, {
    backgroundColor: '#262626',
    scale: 2,
    useCORS: true,
    ignoreElements: el => el.hasAttribute(EXPORT_IGNORE),
  });
  const a = document.createElement('a');
  a.download = `${filename || 'tierlist'}.png`;
  a.href = canvas.toDataURL('image/png');
  a.click();
}
