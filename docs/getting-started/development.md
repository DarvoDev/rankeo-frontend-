<!-- fuente: package.json, README.md, .gitignore, src/room/roomReducer.test.ts | rev: cad3d25 -->
# Desarrollo

## Instalar

```bash
npm install      # hay package-lock.json → npm
npm run dev
```

`[TODO: package.json no declara "engines"; versión mínima de Node sin confirmar (Vite 8 exige Node moderno)]`

## Variables de entorno

| Variable | Uso |
|---|---|
| `VITE_API_URL` | URL de la API Rankeo sin `/` final (p. ej. `http://localhost:8088`). Se lee al compilar. |

`cp .env.example .env`. La API debe incluir el origen del frontend en `CORS_ORIGINS`
(`http://localhost:5173` en desarrollo). Levantar la API: `docker compose up -d` en `rankeo-backend`.

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
- Salas propias: viven en la API. Para probar el tiempo real abrir la misma sala en dos perfiles.
- El apodo se guarda en `tierlist:nombre`; borrarlo para volver a ver `NameModal`.
- `LocalRoomService` (solo `DEMO42`) añade retrasos falsos (700 ms buscar, 600 ms cargar).

## Convenciones del código

- Comentarios y textos de UI en español; componentes con export con nombre, páginas con default.
- Cada componente tiene su `.module.css` al lado.
- Todo cambio de sala es una `RoomAction` → `roomReducer` (puro). Ver
  [state-management.md](../architecture/state-management.md).
