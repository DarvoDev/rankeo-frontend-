<!-- fuente: src/room/roomReducer.ts, src/room/roomService.ts, src/room/useRoom.ts, src/lib/storage.ts, src/components/room/TierBoard.tsx | rev: cad3d25 -->
# Estado

Sin zustand/redux/context de datos. Tres capas:

```
componente ──act(action, text?)──▶ useRoom.dispatch ──▶ roomService.dispatch
                                                            │ roomReducer(room, action)
                                                            │ emit('state' | 'activity' | 'warning')
useRoom (subscribe) ◀───────────────────────────────────────┘ saveRoom / saveActivity
```

Único contexto React: `ToastContext` (función `toast(msg)`).

## roomReducer (`src/room/roomReducer.ts`)

Puro. Si la acción no aplica devuelve **la misma referencia** — `LocalRoomService.dispatch`
corta ahí (no emite, no loguea, no guarda).

| Acción | Efecto | No aplica si |
|---|---|---|
| `item:add` | Agrega a `items` y al final de `pool` | id ya existe |
| `item:move` | Saca de donde esté, inserta en `target` en `index` (acotado; default = final) | item o target no existen |
| `item:delete` | Quita de su lista y de `items` | no existe |
| `tier:update` | Cambia `label` y/o `color` | fila no existe |
| `tier:add` | Fila `'Nuevo'` al final | ya hay `MAX_TIERS` (15) |
| `tier:move` | Intercambia con vecina `up`/`down` | borde o no existe |
| `tier:clear` | Manda sus items al final de `pool` | no existe o vacía |
| `tier:delete` | Borra fila; items al final de `pool` | no existe o es la última |
| `title:update` | Cambia título | siempre aplica |

## LocalRoomService (`src/room/roomService.ts`) — solo `DEMO42`

- Caché en memoria `Map` por código; `get` cae a `loadRoom` si no está en memoria.
- `load('DEMO42')` siempre reemplaza con `demoRoom()` y bitácora vacía; DEMO nunca se guarda.
- Bitácora: entrada nueva al inicio, máximo `MAX_ACTIVITY = 100`.
- Si `saveRoom`/`saveActivity` fallan → un único evento `warning` por sala ("No se pudo guardar…"),
  que `useRoom` muestra como toast. La sala sigue en memoria hasta recargar.

## Persistencia (`src/lib/storage.ts`)

| Clave `localStorage` | Contenido |
|---|---|
| `tierlist:nombre` | Apodo |
| `tierlist:sala:<code>` | `Room` JSON (imágenes incluidas como data URL webp) |
| `tierlist:bitacora:<code>` | `ActivityEntry[]` |

Todas las funciones atrapan excepciones (modo privado, cuota) y nunca lanzan.

> ⚠️ Las imágenes van embebidas como data URL dentro de la sala. La cuota de `localStorage`
> (típicamente ~5 MB por origen, compartida entre todas las salas) se llena tras pocas decenas de
> imágenes; a partir de ahí cada cambio solo vive en memoria. `[TODO: medir tamaño medio de una
> imagen tras shrink para dar un número real]`

> ⚠️ `title:update` se despacha en cada tecla (`EditableText.onInput`) → un `saveRoom` completo
> (con todas las imágenes) por tecla.

## Qué entra en la bitácora

Solo acciones despachadas con texto: subir imagen, mover a otra fila, eliminar imagen, añadir /
vaciar / eliminar fila. **No** se registran: reordenar dentro de la misma fila, renombrar o
recolorear fila, subir/bajar fila, cambiar título.

## Estado local del drag

`TierBoard` guarda una copia `drag.containers` durante el arrastre (vista previa) y despacha **un
solo** `item:move` al soltar. Detalle en [page-components.md](../components/page-components.md#tierboard).
