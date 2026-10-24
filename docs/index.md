<!-- fuente: package.json, README.md, src/App.tsx | rev: 2aee52f -->
# Rankeo · frontend

Tier lists en grupo: crear una sala con código de 6 letras, subir imágenes y arrastrarlas a filas
S–D, con bitácora de movimientos y exportación a PNG. SPA en React 19 + Vite + TypeScript.

> ⚠️ **No hay backend.** Las salas viven en `localStorage` del navegador detrás de la interfaz
> `RoomService`. Pese al copy de la portada ("salas en tiempo real"), dos navegadores **no** ven la
> misma sala, y dos pestañas del mismo navegador **tampoco se sincronizan** (no hay listener del
> evento `storage` ni `BroadcastChannel`). El README dice que es la versión React del prototipo
> en `../tierlist-prototipo/` (fuera de este repo).

## Stack

| Pieza | Paquete |
|---|---|
| UI | `react` / `react-dom` 19 |
| Rutas | `react-router-dom` 7 (`BrowserRouter`) |
| Drag & drop | `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` |
| Export PNG | `html2canvas` (cargado con `import()` dinámico) |
| Fuente portada | `@fontsource-variable/dm-sans` (solo se importa en `HomePage`) |
| Build / dev | `vite` 8, `@vitejs/plugin-react`, `typescript` ~6 |
| Lint / tests | `oxlint`, `vitest` |

Estilos: CSS Modules + `global.css`, sin librería de componentes. Estado: hooks + singleton
`roomService`, sin store global. Nombre del paquete: `tierlist-frontend`; claves de storage usan
prefijo `tierlist:`.

## Cómo navegar estos docs

| Doc | Para |
|---|---|
| [MAP.md](MAP.md) | Símbolo o concepto → archivo |
| [TAREAS.md](TAREAS.md) | Recetas de cambios frecuentes |
| [getting-started/development.md](getting-started/development.md) | Instalar, scripts, tests |
| [getting-started/deployment.md](getting-started/deployment.md) | Desplegar la SPA |
| [architecture/folder-structure.md](architecture/folder-structure.md) | Árbol comentado |
| [architecture/routing.md](architecture/routing.md) | Rutas y flujo de entrada a sala |
| [architecture/state-management.md](architecture/state-management.md) | Flujo de estado, storage, bitácora |
| [architecture/data-layer.md](architecture/data-layer.md) | Contrato `RoomService` (la "API") |
| [components/ui-library.md](components/ui-library.md) | `Modal`, `EditableText`, Toast |
| [components/custom-hooks.md](components/custom-hooks.md) | `useRoom`, `useImageInput`, `useToast` |
| [components/page-components.md](components/page-components.md) | Portada, sala, drag & drop |
| [styles/styling.md](styles/styling.md) | Tokens y convenciones CSS |
| [utils/helpers.md](utils/helpers.md) | `src/lib/*` |
| [configuration/config.md](configuration/config.md) | Vite, tsconfig, oxlint |
