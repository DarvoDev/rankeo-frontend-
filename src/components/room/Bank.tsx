import { useRef } from 'react';
import { cx } from '../../lib/cx';
import { POOL, type Item } from '../../types';
import styles from './Bank.module.css';
import { DropZone } from './DropZone';

interface Props {
  ids: string[];
  items: Record<string, Item>;
  /** Hay archivos arrastrándose sobre la ventana */
  fileOver: boolean;
  onFiles: (files: File[]) => void;
}

/** Banco de imágenes sin clasificar, con el botón para subir */
export function Bank({ ids, items, fileOver, onFiles }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <section className={cx(styles.bank, fileOver && styles.fileOver)}>
      <div className={styles.head}>
        <h2>Imágenes sin clasificar</h2>
        <button className="btn-primary" onClick={() => inputRef.current?.click()}>Subir imágenes</button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={e => { onFiles([...(e.target.files ?? [])]); e.target.value = ''; }}
        />
      </div>
      <DropZone
        id={POOL}
        ids={ids}
        items={items}
        className={styles.pool}
        emptyText="Arrastra imágenes aquí, pégalas con Ctrl+V o usa «Subir imágenes»"
      />
    </section>
  );
}
