import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  pointerWithin,
  TouchSensor,
  useSensor,
  useSensors,
  type Announcements,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type KeyboardCoordinateGetter,
  type UniqueIdentifier,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { POOL, type Room, type RoomAction } from '../../types';
import { Bank } from './Bank';
import { ItemCard } from './ItemCard';
import { TierRow } from './TierRow';
import { Trash, TRASH } from './Trash';
import styles from './TierBoard.module.css';

/** Contenedor (fila o banco) → ids de imágenes en orden */
type Containers = Record<string, string[]>;

const containersOf = (room: Room): Containers => ({
  [POOL]: room.pool,
  ...Object.fromEntries(room.tiers.map(t => [t.id, t.items])),
});

function findContainer(containers: Containers, id: UniqueIdentifier) {
  const key = String(id);
  if (key in containers) return key;
  return Object.keys(containers).find(c => containers[c].includes(key));
}

interface Props {
  room: Room;
  boardRef: RefObject<HTMLDivElement | null>;
  fileOver: boolean;
  /** Aplica un cambio hecho por ti; con texto queda en la bitácora */
  act: (action: RoomAction, text?: string) => void;
  onFiles: (files: File[]) => void;
  onBlocked: (message: string) => void;
  /** Imagen que empiezas o terminas de arrastrar (null al soltar); los demás ven una copia seguir tu puntero */
  onDragChange?: (id: string | null) => void;
}

export function TierBoard({ room, boardRef, fileOver, act, onFiles, onBlocked, onDragChange }: Props) {
  // Mientras arrastras, las filas se pintan desde esta copia; al soltar se confirma un solo cambio
  const [drag, setDrag] = useState<{ id: string; from: string; containers: Containers; keyboard: boolean } | null>(null);
  const containers = drag?.containers ?? containersOf(room);

  // El sensor de teclado se crea al empezar el arrastre: lee el estado actual desde aquí
  const layout = useRef({ containers, order: [] as string[] });
  useLayoutEffect(() => {
    layout.current = { containers, order: [...room.tiers.map(t => t.id), POOL] };
  });

  // ↑/↓ saltan a la fila vecina aunque esté vacía (por defecto dnd-kit se las salta);
  // ←/→ reordenan dentro de la fila como siempre
  const keyboardCoordinates: KeyboardCoordinateGetter = (event, args) => {
    const { over, droppableRects } = args.context;
    if ((event.code === 'ArrowUp' || event.code === 'ArrowDown') && over) {
      const { containers, order } = layout.current;
      const current = findContainer(containers, over.id);
      const next = order[order.indexOf(current ?? '') + (event.code === 'ArrowDown' ? 1 : -1)];
      const rect = next ? droppableRects.get(next) : undefined;
      event.preventDefault();
      return rect ? { x: rect.left, y: rect.top } : undefined;
    }
    return sortableKeyboardCoordinates(event, args);
  };

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: keyboardCoordinates }),
  );

  const placeName = (container: string) => {
    if (container === POOL) return 'el banco';
    if (container === TRASH) return 'la papelera';
    return `la fila ${room.tiers.find(t => t.id === container)?.label ?? ''}`;
  };
  const itemName = (id: UniqueIdentifier) => room.items[String(id)]?.name ?? 'la imagen';

  // Con el puntero: la papelera o la imagen bajo el cursor, si no la fila.
  // Sin puntero (teclado): la fila que contiene el centro de la imagen y, dentro de ella,
  // la imagen más cercana. Elegir entre todas las filas a la vez hace que una fila vacía
  // pierda contra la imagen de al lado y el arrastre oscile entre ambas.
  const collisionDetection: CollisionDetection = args => {
    const hits = pointerWithin(args);
    if (hits.length) {
      const onItems = hits.filter(h => !(String(h.id) in containers) && h.id !== TRASH);
      const onTrash = hits.filter(h => h.id === TRASH);
      return onTrash.length ? onTrash : onItems.length ? onItems : hits;
    }

    const { collisionRect: r, droppableContainers, droppableRects } = args;
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const zones = droppableContainers.filter(c => String(c.id) in containers);
    const zone = zones.find(c => {
      const z = droppableRects.get(c.id);
      return z && cx >= z.left && cx <= z.right && cy >= z.top && cy <= z.bottom;
    });
    if (!zone) return closestCorners({ ...args, droppableContainers: droppableContainers.filter(c => c.id !== TRASH) });
    const inZone = droppableContainers.filter(c => containers[String(zone.id)].includes(String(c.id)));
    return inZone.length ? closestCorners({ ...args, droppableContainers: inZone }) : [{ id: zone.id }];
  };

  function finish() {
    setDrag(null);
    onDragChange?.(null);
  }

  function onDragStart({ active, activatorEvent }: DragStartEvent) {
    const snapshot = containersOf(room);
    const id = String(active.id);
    const keyboard = activatorEvent instanceof KeyboardEvent;
    setDrag({ id, from: findContainer(snapshot, id)!, containers: snapshot, keyboard });
    onDragChange?.(id);
  }

  // Al pasar a otra fila, mueve la imagen en la vista previa
  function onDragOver({ active, over }: DragOverEvent) {
    if (!over || over.id === TRASH) return;
    setDrag(prev => {
      if (!prev) return prev;
      const from = findContainer(prev.containers, active.id);
      const to = findContainer(prev.containers, over.id);
      if (!from || !to || from === to) return prev;
      const toList = [...prev.containers[to]];
      const overIndex = toList.indexOf(String(over.id));
      toList.splice(overIndex >= 0 ? overIndex : toList.length, 0, prev.id);
      return {
        ...prev,
        containers: { ...prev.containers, [from]: prev.containers[from].filter(x => x !== prev.id), [to]: toList },
      };
    });
  }

  function onDragEnd({ over }: DragEndEvent) {
    const current = drag;
    finish();
    if (!current || !over) return;
    const { id, from } = current;
    const name = itemName(id);

    if (over.id === TRASH) {
      act({ type: 'item:delete', id }, `eliminó ${name}`);
      return;
    }

    const target = findContainer(current.containers, id)!;
    let list = current.containers[target];
    const overId = String(over.id);
    if (overId !== id && list.includes(overId)) list = arrayMove(list, list.indexOf(id), list.indexOf(overId));
    const index = list.indexOf(id);

    const original = containersOf(room);
    if (target === from && original[from].indexOf(id) === index) return;
    act({ type: 'item:move', id, target, index }, target !== from ? `movió ${name} a ${placeName(target)}` : undefined);
  }

  const announcements: Announcements = {
    onDragStart: ({ active }) => `Tomaste ${itemName(active.id)}.`,
    onDragOver: ({ active, over }) => over
      ? `${itemName(active.id)} está sobre ${placeName(findContainer(containers, over.id) ?? String(over.id))}.`
      : `${itemName(active.id)} no está sobre ninguna fila.`,
    onDragEnd: ({ active, over }) => over
      ? `Soltaste ${itemName(active.id)} en ${placeName(findContainer(containers, over.id) ?? String(over.id))}.`
      : `Soltaste ${itemName(active.id)}.`,
    onDragCancel: ({ active }) => `Cancelaste el arrastre de ${itemName(active.id)}.`,
  };

  const activeItem = drag ? room.items[drag.id] : null;

  // Supr o Retroceso sobre una imagen la elimina (alternativa a la papelera con teclado)
  function onKeyDown(e: React.KeyboardEvent) {
    if (drag || (e.key !== 'Delete' && e.key !== 'Backspace')) return;
    const id = (e.target as HTMLElement).dataset.itemId;
    if (!id || !room.items[id]) return;
    e.preventDefault();
    act({ type: 'item:delete', id }, `eliminó ${itemName(id)}`);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDragCancel={finish}
      accessibility={{
        announcements,
        screenReaderInstructions: {
          draggable: 'Para mover una imagen pulsa espacio o enter, muévela con las flechas y vuelve a pulsar espacio o enter para soltarla. Escape cancela. Supr la elimina.',
        },
      }}
    >
      <div onKeyDown={onKeyDown}>
        <div ref={boardRef} className={styles.board}>
          {room.tiers.map((tier, i) => (
            <TierRow
              key={tier.id}
              tier={tier}
              ids={containers[tier.id] ?? tier.items}
              items={room.items}
              canUp={i > 0}
              canDown={i < room.tiers.length - 1}
              onChange={patch => act({ type: 'tier:update', id: tier.id, ...patch })}
              onMove={dir => act({ type: 'tier:move', id: tier.id, dir })}
              onClear={() => act({ type: 'tier:clear', id: tier.id }, `vació la fila ${tier.label}`)}
              onDelete={() => {
                if (room.tiers.length <= 1) return onBlocked('La tier list necesita al menos una fila.');
                if (!confirm('¿Eliminar esta fila? Sus imágenes volverán al banco.')) return;
                act({ type: 'tier:delete', id: tier.id }, `eliminó la fila ${tier.label}`);
              }}
            />
          ))}
        </div>

        <Bank ids={containers[POOL]} items={room.items} fileOver={fileOver} onFiles={onFiles} />
      </div>

      {/* Con teclado no hay papelera: se usa Supr */}
      <Trash visible={!!drag && !drag.keyboard} />

      <DragOverlay>
        {activeItem && <ItemCard item={activeItem} overlay />}
      </DragOverlay>
    </DndContext>
  );
}
