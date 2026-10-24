<!-- fuente: src/room/roomService.ts, src/room/useRoom.ts, README.md | rev: 2aee52f -->
# Capa de datos — `RoomService`

No hay llamadas HTTP, WebSocket ni API routes. La "API" es la interfaz `RoomService` en
`src/room/roomService.ts`; la única implementación es `LocalRoomService` (navegador).

## Contrato

| Método | Firma | Quién lo usa |
|---|---|---|
| `exists` | `(code) => Promise<boolean>` | `JoinModal` |
| `create` | `(title) => Promise<Room>` | `Hero` |
| `load` | `(code) => Promise<{ room, activity } \| null>` | `useRoom` |
| `dispatch` | `(code, action, log?) => void` | `useRoom.dispatch` |
| `subscribe` | `(code, listener) => unsubscribe` | `useRoom` |

`RoomEvent` que recibe `listener`:

| `type` | Payload | Efecto en `useRoom` |
|---|---|---|
| `state` | `room: Room` | `setRoom` |
| `activity` | `activity: ActivityEntry[]` (lista completa) | `setActivity` |
| `warning` | `message: string` | `toast(message)` |

`LogEntry = { who: Person, text }`; `useRoom` lo arma con `{ name: myName, color: colorFor(myName) }`.

## Conectar un backend

1. Implementar `RoomService` (p. ej. WebSockets); cambiar `export const roomService`.
2. Cambios de otros usuarios → emitir `state`/`activity` por `subscribe`.

Gotchas que la implementación actual oculta:

> ⚠️ `dispatch` devuelve `void` y la UI **no aplica cambios optimistas**: solo se re-renderiza
> cuando llega `state`. `LocalRoomService` lo emite síncrono; un backend real con latencia hará
> que cada arrastre "rebote" hasta que responda el servidor, salvo que el servicio aplique
> `roomReducer` localmente antes de enviar.

> ⚠️ `useRoom` se suscribe **antes** de `load` y `load` sobrescribe `room`/`activity` al resolver:
> un `state` que llegue entre ambos se pierde si `load` trae datos más viejos.

> ⚠️ `create` en local evita colisiones probando códigos contra `localStorage`; con backend la
> unicidad del código debe decidirla el servidor.

- `RoomStatus` solo tiene `connecting | online | missing`: no hay estado de desconexión/error de
  red. `TopBar` muestra "Conectando…" para todo lo que no sea `online`.
- `roomReducer` está pensado para compartirse: su comentario dice "vengan de ti o de otro usuario".
- Las imágenes viajan como data URL dentro de `Item.url`. `[TODO: con backend probablemente
  convenga subirlas aparte y guardar una URL]`
