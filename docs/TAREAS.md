<!-- fuente: src/types.ts, src/room, src/pages, src/components, src/lib | rev: cad3d25 -->
# TAREAS — recetas "quiero hacer X"

Archivos exactos a tocar, en orden. Todo cambio de sala pasa por `RoomAction` (cliente y servidor usan el mismo reducer).

## Acción nueva sobre la sala (orden obligatorio)

1. `src/types.ts` — agregar variante a `RoomAction` (`'<entidad>:<verbo>'`).
2. `src/room/roomReducer.ts` — `case` en `roomReducer`. Debe ser puro y **devolver la misma
   referencia `room` si no aplica** (`LocalRoomService.dispatch` usa `next === room` para no emitir
   ni guardar ni loguear).
3. `src/room/roomReducer.test.ts` — caso nuevo (incluye el "no aplica → `toBe(room)`").
4. Componente que dispara: `act({ type: ... }, 'texto bitácora')` (`act` = `dispatch` de `useRoom`).
   Sin texto → no entra a la bitácora.
5. `npm test`.

> ⚠️ El switch de `roomReducer` no tiene `default`; con `strict` TS marca error si la nueva
> variante no tiene `case` (la función dejaría de devolver `Room` en todos los caminos).

## Campo nuevo en Room / Tier / Item

1. `src/types.ts` — interfaz.
2. `src/lib/demo.ts` — valor inicial en `newRoom` (y `demoRoom` si aplica).
3. `src/room/roomReducer.ts` — acciones que lo modifican.
4. ⚠️ Salas ya guardadas en `localStorage` (`tierlist:sala:<code>`) **no tendrán el campo**:
   `loadRoom` hace `JSON.parse` sin migración. Tratar el campo como opcional o migrar en `loadRoom`.

## Componente nuevo de la sala

1. `src/components/room/<Nombre>.tsx` + `<Nombre>.module.css` (export con nombre, no default).
2. Clases combinadas con `cx` de `src/lib/cx.ts`; colores con variables de `src/styles/global.css`.
3. Si no debe salir en el PNG exportado: atributo `EXPORT_IGNORE` (ver `TierRow`).
4. Montarlo en `RoomView` (`src/pages/RoomPage.tsx`) o en `TierBoard`.
5. Agregarlo a `docs/MAP.md`.

## Página / ruta nueva

1. `src/pages/<Nombre>Page.tsx` (export default) + `.module.css`.
2. `src/App.tsx` — `<Route>` **antes** del `path="*"`.
3. `document.title` en un `useEffect` (lo hacen `HomePage` y `RoomView`).
4. Ver [architecture/routing.md](architecture/routing.md).

## Cambiar cómo se habla con la API

1. `src/room/signalrRoomService.ts` (HTTP + SignalR). `DEMO42` sigue en `LocalRoomService`.
2. Un método nuevo de `RoomService` → implementarlo en ambas clases y en el compuesto `roomService`.
3. Contrato, optimismo y `version` en [architecture/data-layer.md](architecture/data-layer.md).
4. URL de la API: `VITE_API_URL` en `.env` (ver `.env.example`).

## Color de fila / límite de filas

- Paleta: `TIER_COLORS` en `src/lib/demo.ts` (la usan `TierMenu`, `newRoom` y `addTier`).
- Límite: `MAX_TIERS` en `src/lib/demo.ts` (lo validan `roomReducer` y `addTier` en `RoomPage`).

## Cambiar el formato/tamaño de imágenes subidas

- `IMAGE_SIZE` y calidad webp en `shrink` (`src/lib/image.ts`). La API acepta máx `IMAGEN_MAX_KB`
  (512 KB por defecto); en `DEMO42` más grande = se llena antes la cuota de `localStorage` (ver [architecture/state-management.md](architecture/state-management.md)).
