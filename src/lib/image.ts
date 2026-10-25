const IMAGE_SIZE = 768; // lado del cuadrado donde se guardan las imágenes subidas (grande para verlas ampliadas)

/** Encaja la imagen completa en un cuadrado con franjas negras y reduce para que quepa en el almacenamiento del navegador */
export async function shrink(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const { naturalWidth: w, naturalHeight: h } = img;
    const side = Math.min(IMAGE_SIZE, Math.max(w, h));
    const scale = side / Math.max(w, h);
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = side;
    const ctx = canvas.getContext('2d')!;
    // Las franjas van horneadas en la imagen: así el PNG exportado (html2canvas) la muestra igual
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, side, side);
    ctx.drawImage(img, (side - w * scale) / 2, (side - h * scale) / 2, w * scale, h * scale);
    return canvas.toDataURL('image/webp', 0.85);
  } finally {
    URL.revokeObjectURL(url);
  }
}
