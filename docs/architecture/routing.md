<!-- fuente: src/App.tsx, src/pages/RoomPage.tsx, src/components/home/Hero.tsx, src/components/home/JoinModal.tsx | rev: 2aee52f -->
# Rutas

Router declarativo en `src/App.tsx` (`react-router-dom` 7, `BrowserRouter`). Sin middleware ni
guards: la única "protección" es pedir apodo dentro de `RoomPage`.

| Ruta | Elemento | Nota |
|---|---|---|
| `/` | `HomePage` | Portada |
| `/sala/:codigo` | `RoomPage` | El código pasa por `normalizeCode` (mayúsculas, solo `A-Z0-9`) |
| `*` | `<Navigate to="/" replace />` | Cualquier otra ruta va a la portada |

## Entrar a una sala

1. Desde `Hero` (crear): `roomService.create(título)` → `navigate('/sala/<code>', { state: { created: true } })`.
   `RoomView` lee `location.state.created` y muestra el toast "Sala creada. Código: …".
2. Desde `JoinModal`: exige 6 caracteres tras `normalizeCode`, luego `roomService.exists` → navega.
3. Enlace directo / "Ver ejemplo" (`/sala/DEMO42`): sin validación previa.

## Dentro de `RoomPage`

- Sin apodo (`getName()` vacío) → solo `NameModal` (no cerrable). Al enviar: `setName` + estado.
- Con apodo → `<RoomView key={code}>`; la `key` remonta todo al cambiar de código.
- `useRoom` → `status`: `connecting` (texto "Conectando con la sala…"), `online`, o `missing`
  → `RoomNotFound` ("Falta el código…" si el código normalizado queda vacío).

> ⚠️ `/sala/abc-123` y `/sala/ABC123` abren la misma sala (`normalizeCode`), pero la URL no se
> reescribe: "Copiar enlace" copia `window.location.href` tal cual.

## Títulos

`document.title` se fija a mano: `HomePage` → "Rankeo · Tier lists en grupo"; `RoomView` →
`"<título> · Rankeo"`.
