<!-- fuente: package.json, README.md, .gitignore, src/room/roomReducer.test.ts | rev: 2aee52f -->
# Desarrollo

## Instalar

```bash
npm install      # hay package-lock.json → npm
npm run dev
```

`[TODO: package.json no declara "engines"; versión mínima de Node sin confirmar (Vite 8 exige Node moderno)]`

## Variables de entorno

Ninguna. No hay `import.meta.env` en `src/`. `.gitignore` ya ignora `.env` / `.env.*` (deja pasar
`.env.example`) pensando en el futuro backend.

## Scripts

| Script | Comando | Nota |
|---|---|---|
| `dev` | `vite` | |
| `build` | `tsc -b && vite build` | Falla si hay errores de tipos; salida en `dist/` |
| `preview` | `vite preview` | Sirve `dist/` |
| `test` | `vitest run` | Sin config propia de vitest; usa `vite.config.ts` |
| `lint` | `oxlint` | Reglas en `.oxlintrc.json` |

## Tests

Solo existe `src/room/roomReducer.test.ts` (9 casos sobre `roomReducer` y `containerOf`). Ayudantes
del archivo: `item(id)` y `roomWith(...ids)`. Componentes, hooks y `LocalRoomService` no tienen
tests. Agregar un caso por cada acción nueva (ver [TAREAS.md](../TAREAS.md#acción-nueva-sobre-la-sala-orden-obligatorio)).

## Probar a mano

- Sala de ejemplo: `/sala/DEMO42` — se regenera en cada carga y **nunca se guarda**.
- Salas propias: persisten en `localStorage` del navegador (claves `tierlist:*`). Para empezar
  limpio, borrar esas claves en DevTools.
- El apodo se guarda en `tierlist:nombre`; borrarlo para volver a ver `NameModal`.
- `LocalRoomService` añade retrasos falsos (700 ms buscar/crear, 600 ms cargar).

## Convenciones del código

- Comentarios y textos de UI en español; componentes con export con nombre, páginas con default.
- Cada componente tiene su `.module.css` al lado.
- Todo cambio de sala es una `RoomAction` → `roomReducer` (puro). Ver
  [state-management.md](../architecture/state-management.md).
