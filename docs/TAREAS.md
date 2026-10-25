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

## Brillo (glow) de fila

- Dato: `Tier.glow` (0–3) en `src/types.ts`; se cambia con `tier:update` (`roomReducer`). El backend valida
  el rango en `SalaService.Validar` y lo refleja en `Dominio/Room.cs` (`rankeo-backend`).
- Aspecto: `.glow1`–`.glow3` en `TierRow.module.css` (`box-shadow` con `--glow-color` = color de la fila).
- Control: slider "Brillo" en `TierMenu`. Subir el máximo = cambiar `max` del slider, las clases CSS y el
  rango en el backend.

## Color de fila / límite de filas

- Paleta: `TIER_COLORS` en `src/lib/demo.ts` (la usan `TierMenu`, `newRoom` y `addTier`).
- Límite: `MAX_TIERS` en `src/lib/demo.ts` (lo validan `roomReducer` y `addTier` en `RoomPage`).

## Cambiar el formato/tamaño de imágenes subidas

- `IMAGE_SIZE` y calidad webp en `shrink` (`src/lib/image.ts`). La API acepta máx `IMAGEN_MAX_KB`
  (512 KB por defecto); en `DEMO42` más grande = se llena antes la cuota de `localStorage` (ver [architecture/state-management.md](architecture/state-management.md)).

## Subtítulo de imagen

- Dato: `Item.caption` (opcional, máx `CAPTION_MAX` = 80). Se pide en `CaptionModal` (`src/components/room/`) al
  subir: `addImages` recorta y deja las imágenes en `pending`; `upload` llama `roomService.addImage(..., caption)`.
- Transporte: campo `subtitulo` del multipart (`SignalRRoomService.addImage`); el backend lo valida (≤ 80) y lo
  guarda en el `jsonb` (`ImagenService.Subir`, `SalaService.Validar`). Sin migración.
- Vista: `title` de `ItemCard` + franja `.caption` al pasar el cursor (`ItemCard.module.css`, opacidad 0 → no
  sale en el PNG); también en la vista ampliada.

## Sub-tier list (derivar una sala)

1. `deriveRoom` (`src/room/derive.ts`, puro, con test) define qué se copia: filas con ids nuevos y vacías, imágenes
   con ids nuevos al banco en orden visual, `parent` = código origen, título dado o el del padre.
2. `RoomService.derive(code, title, by)` → `POST /api/salas/{code}/derivadas` `{ title, apodo }` (rate limit
   "crear"). El servidor (`SalaService.Derivar`) copia los archivos al volumen de la sala nueva.
3. UI: botón "Sub-tier list" en `RoomPage` → `DeriveModal` → `navigate` a la sala nueva; `TopBar` enlaza al padre.
4. `DEMO42` no se puede derivar (`roomService.derive` rechaza): sus imágenes no existen en la API.

## Presencia y cursores (efímeros)

- El servidor manda `presence` (lista completa `Presence[]`) a la sala al entrar/salir; `useRoom` lo expone como
  `people` (si nunca llega, solo tú) y `Sidebar` lo pinta.
- Tu puntero: `useCursorBroadcast(code, areaRef, enabled, dragId)` en `RoomView`, px relativos a `areaRef`
  (tablero + banco), máx uno cada `CURSOR_INTERVAL` ms, `away` al salir de la ventana. `dragId` viene de
  `TierBoard.onDragChange`.
- Los demás: `useRemoteCursors` guarda el último `cursor` por conexión y descarta los de quien ya no está en
  `people`; `CursorLayer` (absoluto dentro de `.area`, `pointer-events: none`, `EXPORT_IGNORE`) dibuja flecha,
  apodo y la copia de la imagen arrastrada.
- Nada de esto se guarda ni pasa por el reducer. Cambiar la frecuencia: `CURSOR_INTERVAL`.
