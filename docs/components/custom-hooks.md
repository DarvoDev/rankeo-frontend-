<!-- fuente: src/room/useRoom.ts, src/room/useImageInput.ts, src/components/ui/toastContext.ts | rev: 0ed1e18 -->
# Hooks propios

Todos en uso; ninguno legado.

## useRoom (`src/room/useRoom.ts`)

`useRoom(code, myName) → { room, status, activity, dispatch }`

- Al montar: `roomService.subscribe(code, …)` y luego `roomService.load(code)`.
- `status`: `'connecting'` → `'online'` si `load` trae sala, `'missing'` si no.
- Si `load` falla (red, API caída): toast "No se pudo conectar con la sala." (solo la primera vez) y
  reintenta cada 3 s hasta que responda.
- Evento `online` (reconexión de SignalR) → `status` `'connecting'` / `'online'`.
- `dispatch(action, text?)`: con `text` agrega `{ who: me, text }` a la bitácora.
- `me = { name: myName, color: colorFor(myName) }`.
- Eventos `warning` → `toast`.
- Usado solo por `RoomView` (en `src/pages/RoomPage.tsx`), que lo renombra a `act`.

Ver [data-layer.md](../architecture/data-layer.md) para la carrera subscribe/load.

## useImageInput (`src/room/useImageInput.ts`)

`useImageInput(onFiles, enabled) → fileOver: boolean`

- Escucha en `window`: `dragenter/dragleave/dragover/drop` (solo si el drag trae `Files`) y `paste`
  (items `kind === 'file'`).
- Contador `depth` para que `dragleave` de hijos no apague el resaltado.
- `onFiles` se guarda en ref → el efecto no se re-suscribe en cada render.
- `RoomView` lo activa solo con `status === 'online'`; `fileOver` resalta el `Bank`.
- No filtra por tipo: el filtro `image/*` está en `addImages` de `RoomPage`.

## useToast (`src/components/ui/toastContext.ts`)

`useToast() → (message: string) => void`. Default del contexto es no-op.
