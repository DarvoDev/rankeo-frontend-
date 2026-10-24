<!-- fuente: src/components/ui | rev: 2aee52f -->
# Primitivos de UI (`src/components/ui/`)

Sin librería externa (ni shadcn, ni MUI). Tres piezas propias.

## Modal

`Modal({ title, children, onClose?, className? })` — overlay + tarjeta `role="dialog"`.

- Con `onClose`: botón ×, Escape y clic en el overlay cierran.
- Sin `onClose`: no se puede cerrar (lo usan `NameModal` y `RoomNotFound`).
- `aria-labelledby="modal-title"` es un id fijo: dos modales a la vez tendrían id duplicado
  (hoy nunca ocurre).
- No atrapa el foco (sin focus trap). `[TODO: confirmar si es aceptable para a11y]`

## EditableText

`EditableText({ value, onChange, as?: 'h1' | 'div', className?, style?, label })` — texto
`contentEditable` con `role="textbox"`.

- **No controlado** mientras tiene foco: ignora `value` externo para no mover el cursor.
- `onChange` en cada `input` con el texto `trim()`eado. Enter hace blur.
- Al perder foco, si el texto difiere de `value`, lo restaura a `value`.
- Usos: título de la sala (`RoomPage`) y etiqueta de cada fila (`TierRow`).

> ⚠️ Vaciar el texto despacha `''` (no hay validación de vacío): el título o la etiqueta de la
> fila pueden quedar vacíos.

## Toast

- `ToastProvider` (en `Toast.tsx`) envuelve toda la app en `App.tsx`; un solo mensaje visible,
  `TOAST_MS = 2500`, `role="status"`.
- `useToast()` y `ToastContext` en `toastContext.ts` → `toast(texto)`.
- Un toast nuevo reemplaza al anterior.

## Diálogos nativos

Además se usan `confirm()` (eliminar fila, en `TierBoard`) y `prompt()` (fallback de "Copiar
enlace" si falla el portapapeles, en `RoomPage`).
