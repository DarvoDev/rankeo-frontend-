import { useLayoutEffect, useRef, type CSSProperties } from 'react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  as?: 'h1' | 'div';
  className?: string;
  style?: CSSProperties;
  label: string;
}

/**
 * Texto editable en el sitio (contentEditable).
 * No es controlado: mientras tiene el foco ignora cambios externos para no mover el cursor.
 */
export function EditableText({ value, onChange, as = 'div', className, style, label }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const Tag = as as 'div';

  useLayoutEffect(() => {
    const el = ref.current;
    if (el && document.activeElement !== el && el.textContent !== value) el.textContent = value;
  }, [value]);

  return (
    <Tag
      ref={ref}
      className={className}
      style={style}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      role="textbox"
      aria-label={label}
      onInput={e => onChange(e.currentTarget.textContent?.trim() ?? '')}
      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
      onBlur={e => { if (e.currentTarget.textContent !== value) e.currentTarget.textContent = value; }}
    />
  );
}
