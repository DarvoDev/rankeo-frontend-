<!-- fuente: src | rev: cad3d25 -->
# MAP — dónde está cada cosa

Primer destino de toda búsqueda. Regenerar la columna mecánica con `sh docs/docs.sh map`.

## Entradas

| Archivo | Por qué empezar aquí |
|---|---|
| `src/main.tsx` | Monta React, importa `styles/global.css` |
| `src/App.tsx` | Router (`/`, `/sala/:codigo`, `*` → `/`) + `ToastProvider` |
| `src/types.ts` | Modelo: `Room`, `Tier`, `Item`, `RoomAction`, `ActivityEntry`, `POOL` |
| `src/room/roomReducer.ts` | Toda mutación de una sala (puro, con tests) |
| `src/room/roomService.ts` | Interfaz `RoomService` + `LocalRoomService` (DEMO42) + compuesto `roomService` |
| `src/room/signalrRoomService.ts` | `SignalRRoomService`: API real (HTTP + SignalR) |
| `src/pages/RoomPage.tsx` | Pantalla de la sala: une hook, tablero, subida de imágenes, PNG |
| `src/components/room/TierBoard.tsx` | Drag & drop completo (dnd-kit), papelera, teclado |
| `src/lib/demo.ts` | Sala nueva por defecto, sala `DEMO42`, `MAX_TIERS`, `TIER_COLORS` |

## Símbolos

### Modelo y lógica (`src/types.ts`, `src/room/`)

| Símbolo | Archivo | Qué hace |
|---|---|---|
| `POOL` | `src/types.ts` | Id `'pool'` del banco de imágenes sin clasificar |
| `Item`, `Tier`, `Room`, `Person`, `ActivityEntry` | `src/types.ts` | |
| `RoomAction` | `src/types.ts` | Unión de las 9 acciones (`item:*`, `tier:*`, `title:update`) |
| `roomReducer` | `src/room/roomReducer.ts` | Aplica una `RoomAction`; devuelve la misma referencia si no aplica |
| `listOf` | `src/room/roomReducer.ts` | Lista de ids de un contenedor (fila o `POOL`) |
| `containerOf` | `src/room/roomReducer.ts` | Contenedor donde está una imagen |
| `RoomService` | `src/room/roomService.ts` | Contrato `exists/create/load/dispatch/addImage/subscribe` |
| `RoomEvent` | `src/room/roomService.ts` | Eventos `state` / `activity` / `warning` / `online` |
| `LogEntry` | `src/room/roomService.ts` | `{who, text}` que acompaña un cambio en la bitácora |
| `roomService` | `src/room/roomService.ts` | Compuesto: `DEMO42` → `LocalRoomService`, resto → `SignalRRoomService` |
| `SignalRRoomService` | `src/room/signalrRoomService.ts` | Optimista + `version`; `withApi` (URLs de imagen), `hubMessage` |
| `VITE_API_URL` | `src/room/signalrRoomService.ts` | URL base de la API (`.env`) |
| `useRoom` | `src/room/useRoom.ts` | Estado de sala + bitácora + `dispatch(action, text?)` |
| `RoomStatus` | `src/room/useRoom.ts` | `'connecting' \| 'online' \| 'missing'` |
| `useImageInput` | `src/room/useImageInput.ts` | Drop de archivos en toda la ventana + Ctrl+V |

### Utilidades (`src/lib/`)

| Símbolo | Archivo | Qué hace |
|---|---|---|
| `cx` | `src/lib/cx.ts` | Une clases ignorando falsy |
| `DEMO_CODE`, `MAX_TIERS`, `TIER_COLORS` | `src/lib/demo.ts` | `'DEMO42'`, `15`, paleta de 12 colores |
| `newRoom` | `src/lib/demo.ts` | Sala vacía con filas S/A/B/C/D |
| `demoRoom` | `src/lib/demo.ts` | Sala de ejemplo con tarjetas SVG de comida |
| `exportPng`, `EXPORT_IGNORE` | `src/lib/exportPng.ts` | PNG del tablero vía html2canvas (import dinámico) |
| `newId`, `pick` | `src/lib/ids.ts` | |
| `generateCode` | `src/lib/ids.ts` | Código de sala de 6 chars sin 0/O/1/I |
| `normalizeCode` | `src/lib/ids.ts` | Mayúsculas, quita todo lo no `A-Z0-9` |
| `colorFor` | `src/lib/ids.ts` | Color HSL estable a partir de un nombre |
| `shrink` | `src/lib/image.ts` | Imagen completa en cuadrado 768px con franjas negras → data URL webp |
| `getName`, `setName` | `src/lib/storage.ts` | Apodo en `localStorage` |
| `loadRoom`, `saveRoom`, `loadActivity`, `saveActivity` | `src/lib/storage.ts` | Persistencia en `localStorage` (nunca lanzan) |

### Componentes

| Símbolo | Archivo | Qué hace |
|---|---|---|
| `App` | `src/App.tsx` | |
| `HomePage` | `src/pages/HomePage.tsx` | Portada |
| `RoomPage` | `src/pages/RoomPage.tsx` | Pide apodo y renderiza `RoomView` (interno) |
| `Nav`, `Hero`, `HowItWorks`, `Footer`, `Logo`, `DecoCards` | `src/components/home/` | Secciones de la portada |
| `JoinModal` | `src/components/home/JoinModal.tsx` | Unirse con código (valida 6 chars + `exists`) |
| `TierBoard` | `src/components/room/TierBoard.tsx` | `DndContext` del tablero |
| `TierRow`, `TierMenu` | `src/components/room/` | Fila y su menú ⚙ (color, slider de brillo `glow` 0–3) |
| `DropZone` | `src/components/room/DropZone.tsx` | Contenedor ordenable (fila o banco) |
| `ItemCard`, `SortableItem` | `src/components/room/ItemCard.tsx` | Imagen; versión arrastrable; doble clic = vista ampliada (`Modal`) |
| `Bank` | `src/components/room/Bank.tsx` | Banco + botón "Subir imágenes" |
| `Trash`, `TRASH` | `src/components/room/Trash.tsx` | Papelera droppable (solo ratón/táctil) |
| `Sidebar` | `src/components/room/Sidebar.tsx` | Bitácora |
| `TopBar`, `NameModal`, `RoomNotFound` | `src/components/room/` | |
| `Modal`, `EditableText` | `src/components/ui/` | Primitivos propios |
| `ToastProvider`, `ToastContext`, `useToast` | `src/components/ui/Toast.tsx`, `toastContext.ts` | Toast global |

## Conceptos → archivo

| Concepto | Dónde vive |
|---|---|
| Crear sala | `Hero` (`create`) → `roomService.create` → `POST /api/salas` |
| Unirse con código | `JoinModal` → `roomService.exists`; `normalizeCode` |
| Código de sala (formato, colisiones) | `generateCode` en `src/lib/ids.ts`; bucle en `LocalRoomService.create` |
| Sala de ejemplo / demo | `demoRoom`, `DEMO_CODE` en `src/lib/demo.ts`; caso especial en `LocalRoomService.load` |
| Apodo del usuario | `NameModal`, `getName/setName`; color en `colorFor` |
| Mover imagen entre filas | `TierBoard` (`onDragOver`/`onDragEnd`) → acción `item:move` en `roomReducer` |
| Eliminar imagen | `Trash` (arrastre) o Supr/Retroceso (`onKeyDown` en `TierBoard`) → `item:delete` |
| Drag con teclado / lector de pantalla | `keyboardCoordinates`, `announcements`, `collisionDetection` en `TierBoard` |
| Subir / pegar / soltar imágenes | `Bank` (input), `useImageInput` (ventana), `addImages` en `RoomPage`, `shrink` |
| Filas: añadir, color, brillo, subir/bajar, vaciar, borrar | `addTier` en `RoomPage`; `TierMenu`; casos `tier:*` en `roomReducer` |
| Límite de filas / mínimo una fila | `MAX_TIERS`; `tier:add` y `tier:delete` en `roomReducer` |
| Título editable | `EditableText` en `RoomPage` → `title:update` |
| Bitácora de movimientos | texto en cada `act(..., text)`; `LocalRoomService.dispatch` (máx 100); `Sidebar` |
| Persistencia en navegador / cuota llena | `src/lib/storage.ts`; evento `warning` en `LocalRoomService.dispatch` |
| Retrasos falsos (solo DEMO42) | `LOOKUP_DELAY`, `CONNECT_DELAY` en `src/room/roomService.ts` |
| Conectar backend real | [architecture/data-layer.md](architecture/data-layer.md) |
| Exportar PNG | `download` en `RoomPage` → `exportPng`; `EXPORT_IGNORE` en `TierRow` |
| Copiar enlace | `copyLink` en `RoomPage` |
| Toasts / avisos | `ToastProvider`, `useToast` |
| Tema / colores | `src/styles/global.css` (sala), `.landing` en `src/pages/HomePage.module.css` (portada) |
