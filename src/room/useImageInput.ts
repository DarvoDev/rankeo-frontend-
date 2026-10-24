import { useEffect, useLayoutEffect, useRef, useState } from 'react';

const isFileDrag = (e: DragEvent) => [...(e.dataTransfer?.types ?? [])].includes('Files');

/**
 * Recibe imágenes soltadas en cualquier parte de la ventana o pegadas con Ctrl+V.
 * Devuelve si hay archivos arrastrándose encima, para resaltar el banco.
 */
export function useImageInput(onFiles: (files: File[]) => void, enabled: boolean) {
  const [fileOver, setFileOver] = useState(false);
  const onFilesRef = useRef(onFiles);
  useLayoutEffect(() => { onFilesRef.current = onFiles; });

  useEffect(() => {
    if (!enabled) return;
    let depth = 0;
    const onEnter = (e: DragEvent) => { if (isFileDrag(e)) { depth++; setFileOver(true); } };
    const onLeave = (e: DragEvent) => { if (isFileDrag(e) && --depth <= 0) setFileOver(false); };
    const onOver = (e: DragEvent) => { if (isFileDrag(e)) e.preventDefault(); };
    const onDrop = (e: DragEvent) => {
      if (!isFileDrag(e)) return;
      e.preventDefault();
      depth = 0;
      setFileOver(false);
      onFilesRef.current([...(e.dataTransfer?.files ?? [])]);
    };
    const onPaste = (e: ClipboardEvent) => {
      const files = [...(e.clipboardData?.items ?? [])]
        .filter(i => i.kind === 'file')
        .map(i => i.getAsFile())
        .filter((f): f is File => !!f);
      if (files.length) { e.preventDefault(); onFilesRef.current(files); }
    };
    window.addEventListener('dragenter', onEnter);
    window.addEventListener('dragleave', onLeave);
    window.addEventListener('dragover', onOver);
    window.addEventListener('drop', onDrop);
    window.addEventListener('paste', onPaste);
    return () => {
      window.removeEventListener('dragenter', onEnter);
      window.removeEventListener('dragleave', onLeave);
      window.removeEventListener('dragover', onOver);
      window.removeEventListener('drop', onDrop);
      window.removeEventListener('paste', onPaste);
    };
  }, [enabled]);

  return fileOver;
}
