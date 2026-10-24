const IMAGE_SIZE = 256; // las imágenes subidas se recortan a un cuadrado de este tamaño

/** Recorta al centro en cuadrado y reduce para que quepa en el almacenamiento del navegador */
export async function shrink(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const crop = Math.min(img.naturalWidth, img.naturalHeight);
    const side = Math.min(IMAGE_SIZE, crop);
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = side;
    canvas.getContext('2d')!.drawImage(img,
      (img.naturalWidth - crop) / 2, (img.naturalHeight - crop) / 2, crop, crop,
      0, 0, side, side);
    return canvas.toDataURL('image/webp', 0.85);
  } finally {
    URL.revokeObjectURL(url);
  }
}
