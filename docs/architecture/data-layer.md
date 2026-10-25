<!-- fuente: src/room/roomService.ts, src/room/signalrRoomService.ts, src/room/useRoom.ts | rev: 90862b9 -->
# Capa de datos — `RoomService`

La UI solo habla con la interfaz `RoomService` (`src/room/roomService.ts`). `roomService` es un
compuesto que elige implementación por código:

| Código | Implementación | Dónde vive la sala |
|---|---|---|
| `DEMO42` | `LocalRoomService` (`roomService.ts`) | Memoria del navegador; se regenera al cargar, nunca se guarda |
| cualquier otro | `SignalRRoomService` (`signalrRoomService.ts`) | API Rankeo (`rankeo-backend`): HTTP + SignalR `/hubs/sala` |

`create` siempre va a la API. La API se configura con `VITE_API_URL` (sin `/` final).

## Contrato

| Método | Firma | Quién lo usa | SignalR |
|---|---|---|---|
| `exists` | `(code) => Promise<boolean>` | `JoinModal` | `GET /api/salas/{code}` → 204/404 |
| `create` | `(title) => Promise<Room>` | `Hero` | `POST /api/salas` |
| `load` | `(code) => Promise<{ room, activity } \| null>` | `useRoom` | conecta + `invoke('Unirse', code, apodo)` |
| `dispatch` | `(code, action, log?) => void` | `useRoom.dispatch` | optimista + `invoke('Despachar', action)` |
| `addImage` | `(code, dataUrl, name, by) => Promise<void>` | `RoomPage.addImages` | `POST /api/salas/{code}/imagenes` (multipart) |
| `subscribe` | `(code, listener) => unsubscribe` | `useRoom` | eventos `state` / `activity` del hub |

`RoomEvent`: `state` (`room`) → `setRoom`; `activity` (lista completa, últimas 100) → `setActivity`;
`warning` (`message`) → `toast`.

## SignalRRoomService

- **Optimista:** `dispatch` aplica `roomReducer` local y emite `state` al instante; el `state` del
  servidor lo reemplaza. Si el hub rechaza la acción (`HubException`) vuelve al último estado
  confirmado y emite `warning` con el mensaje del servidor.
- **`version`:** cada `state` del servidor trae `version`; los más viejos que el confirmado se descartan
  (estados desordenados con escrituras simultáneas).
- **Bitácora:** el `log` de `dispatch` se ignora; texto, autor y color los calcula el servidor.
- **Imágenes:** `addImage` sube el data URL ya recortado como blob; la imagen llega a todos (también a
  quien la subió) por `state`. URLs relativas `/imagenes/...` → se les antepone `VITE_API_URL` en `withApi`.
- **Reconexión:** `withAutomaticReconnect`; en `onreconnected` vuelve a `Unirse` (los grupos de
  SignalR no sobreviven) y re-emite `state` + `activity`.
- **Errores:** `load` devuelve `null` si el hub responde con error de regla (sala inexistente);
  error de red → rechaza y `useRoom` muestra "No se pudo conectar con la sala.".
- Una sola conexión por pestaña; al cambiar de sala `Unirse` cambia de grupo en el servidor.

> ⚠️ Exportar PNG con imágenes de la API requiere CORS: `crossOrigin="anonymous"` en `ItemCard` y
> `useCORS: true` en `exportPng`. La API sirve `/imagenes` con CORS para los orígenes de `CORS_ORIGINS`.

- `RoomStatus` sigue siendo `connecting | online | missing`: no hay estado de "desconectado".
