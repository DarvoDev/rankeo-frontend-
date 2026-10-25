<!-- fuente: src/pages, src/components/home, src/components/room | rev: 0ed1e18 -->
# Páginas y componentes

## Portada (`HomePage`, `src/components/home/`)

| Componente | Qué hace |
|---|---|
| `Nav` | Logo, "Cómo funciona" (`#como-funciona`), "Ver ejemplo" (`/sala/DEMO42`), Unirse, Crear (hace scroll y enfoca el input del `Hero`) |
| `Hero` | Formulario "Ponle nombre a tu tier list" (max 80) → `roomService.create`; badge enlaza a la demo |
| `DecoCards` | Tarjetas decorativas `aria-hidden` |
| `HowItWorks` | 3 pasos estáticos + mini tier list decorativa |
| `Footer` | Mismos enlaces que `Nav` |
| `JoinModal` | Código de 6 chars → `exists` → navega; botón para rellenar `DEMO42` |
| `Logo` | SVG de 3 barras |

Título vacío al crear → `newRoom` usa `'Mi Tier List'`.

## Sala (`RoomPage` → `RoomView`)

`RoomView` (no exportado) orquesta: `useRoom`, `useImageInput`, `addImages`, `addTier`,
`copyLink`, `download`. Layout: `TopBar`, título editable + botones, `TierBoard`, `Sidebar`.

| Componente | Qué hace |
|---|---|
| `TopBar` | ← Inicio, código, Copiar enlace, estado "En línea"/"Conectando…" |
| `TierBoard` | Ver abajo |
| `TierRow` | Etiqueta editable (clase `long` si > 3 chars), `DropZone`, `TierMenu` con `EXPORT_IGNORE` |
| `TierMenu` | ⚙: paleta `TIER_COLORS`, subir/bajar, vaciar, eliminar. Cierra con clic fuera / Escape |
| `DropZone` | `useDroppable` + `SortableContext` (`rectSortingStrategy`); texto vacío vía `data-empty` |
| `ItemCard` / `SortableItem` | `<img>`; tooltip "subida por X"; `data-item-id` para Supr |
| `Bank` | Banco (`POOL`) + input file `accept="image/*" multiple` |
| `Trash` | Droppable `TRASH`; deshabilitado cuando no se ve |
| `Sidebar` | Bitácora; hora o fecha+hora si no es de hoy (`Intl` 'es') |
| `NameModal` | Apodo (max 30), obligatorio |
| `RoomNotFound` | Sala inexistente → volver al inicio |

### Subir imágenes (`addImages` en `RoomPage`)

Filtra `image/*`; nombre = nombre de archivo sin extensión, máx 30 chars (o `'Imagen'`);
`shrink` → `roomService.addImage(code, dataUrl, name, myName)`. En `DEMO42` es un `item:add` local con
bitácora "subió X"; en las demás salas, `POST` multipart a la API (el servidor escribe la bitácora).
`shrink` falla → toast "No se pudo leer …"; la API rechaza → toast con su `detail`.
Secuencial (un `await` por archivo).

## TierBoard

`src/components/room/TierBoard.tsx`, el archivo más complejo.

- **Vista previa**: `drag = { id, from, containers, keyboard }`. Durante el arrastre las filas se
  pintan desde `drag.containers`; `onDragOver` mueve el id entre contenedores en esa copia.
- **Al soltar** (`onDragEnd`): sobre `TRASH` → `item:delete`. Si no, calcula índice con
  `arrayMove` y despacha **un** `item:move`; texto de bitácora solo si cambió de fila. No
  despacha si quedó en el mismo sitio.
- **Sensores**: ratón (distancia 5px), táctil (delay 150ms, tolerancia 5), teclado.
- **Teclado**: `keyboardCoordinates` hace que ↑/↓ salten a la fila vecina aunque esté vacía
  (orden: filas y luego banco); ←/→ usan `sortableKeyboardCoordinates`. Supr/Retroceso sobre una
  imagen enfocada la elimina (`onKeyDown`). Con teclado no aparece la papelera.
- **Colisiones** (`collisionDetection`): con puntero prioriza papelera > imagen > fila. Sin
  puntero, primero la fila que contiene el centro, luego `closestCorners` dentro de ella (evita
  oscilar entre fila vacía e imagen vecina).
- **A11y**: `announcements` en español y `screenReaderInstructions`.
- `boardRef` apunta solo a las filas (no al banco): eso es lo que exporta el PNG.
- Eliminar fila pide `confirm()`; con una sola fila → `onBlocked` (toast).

> ⚠️ Mover una imagen al banco desde una fila sí entra a la bitácora ("movió X a el banco" —
> `placeName` devuelve `'el banco'`, de ahí el "a el").
