<!-- fuente: src/styles/global.css, src/pages/HomePage.module.css, src/lib/exportPng.ts | rev: 0ed1e18 -->
# Estilos

CSS Modules (`<Componente>.module.css` junto a cada `.tsx`) + `src/styles/global.css`. Sin
Tailwind, sin preprocesador, sin CSS-in-JS. Clases condicionales con `cx`. Tema oscuro fijo, sin
modo claro.

## Tokens globales (`:root` en `global.css`) — sala

| Variable | Valor |
|---|---|
| `--bg` | `#1a1a1a` |
| `--surface` / `--surface-2` | `#242424` / `#2d2d2d` |
| `--board` | `#262626` |
| `--line` | `#000` |
| `--border` | `#3a3a3a` |
| `--text` / `--muted` | `#eee` / `#9a9a9a` |
| `--accent` / `--accent-hover` | `#6aa9ff` / `#82b8ff` |
| `--danger` / `--ok` | `#ff8a8a` / `#7fd18b` |
| `--cell` | `100px` (72px bajo 600px de ancho) — tamaño de cada imagen |

Fuente de la sala: `system-ui`.

## Tokens de portada (`.landing` en `HomePage.module.css`)

`--ink`, `--ink-soft`, `--glass`, `--glass-border`, `--grad-word` (degradado rosa→naranja→
amarillo `#f0609e → #f58f5c → #f7c548`, mismos colores del `Logo`). Fuente "DM Sans Variable",
importada solo en `HomePage.tsx`. La portada tiene identidad visual distinta a la sala.

## Clases globales reutilizables

| Clase | Uso |
|---|---|
| `button`, `.btn` | Botón base gris |
| `.btn-primary` | Botón azul de acento |
| `.pill-white` | Botón píldora blanco de la portada |
| `input[type="text"]` | Input base (ancho 100%) |
| `label.field` | Etiqueta de formulario |
| `.error` | Texto de error con altura mínima reservada |

## Colores fuera de los tokens

`TIER_COLORS` (`src/lib/demo.ts`), colores inline en `DecoCards`/`HowItWorks`/`Logo`, y
`backgroundColor: '#262626'` hardcoded en `exportPng` (igual a `--board`; si cambia el token,
cambiar también ahí).
