import { cx } from '../../lib/cx';
import { EXPORT_IGNORE } from '../../lib/exportPng';
import type { CSSProperties } from 'react';
import type { Item, Tier } from '../../types';
import { EditableText } from '../ui/EditableText';
import { DropZone } from './DropZone';
import { TierMenu } from './TierMenu';
import styles from './TierRow.module.css';

interface Props {
  tier: Tier;
  /** Imágenes de la fila (pueden venir de la vista previa durante un arrastre) */
  ids: string[];
  items: Record<string, Item>;
  canUp: boolean;
  canDown: boolean;
  onChange: (patch: { label?: string; color?: string; glow?: number }) => void;
  onMove: (dir: 'up' | 'down') => void;
  onClear: () => void;
  onDelete: () => void;
}

export function TierRow({ tier, ids, items, canUp, canDown, onChange, onMove, onClear, onDelete }: Props) {
  return (
    <div
      className={cx(styles.tier, !!tier.glow && styles[`glow${tier.glow}`])}
      style={{ '--glow-color': tier.color } as CSSProperties}
    >
      <EditableText
        className={cx(styles.label, tier.label.length > 3 && styles.long)}
        style={{ background: tier.color }}
        value={tier.label}
        onChange={label => onChange({ label })}
        label={`Nombre de la fila ${tier.label}`}
      />
      <DropZone id={tier.id} ids={ids} items={items} />
      <div className={styles.tools} {...{ [EXPORT_IGNORE]: '' }}>
        <TierMenu
          label={tier.label}
          color={tier.color}
          glow={tier.glow ?? 0}
          canUp={canUp}
          canDown={canDown}
          onColor={color => onChange({ color })}
          onGlow={glow => onChange({ glow })}
          onMove={onMove}
          onClear={onClear}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}
