# Rankeo · frontend

Tier lists en grupo. SPA React 19 + Vite + TS. Sin backend: las salas viven en `localStorage`
detrás de `RoomService` (`src/room/roomService.ts`).

## Protocolo de búsqueda (en este orden, no lo saltes)

1. `docs/MAP.md` — símbolo o concepto → archivo. Casi siempre basta.
2. `docs/TAREAS.md` — si vas a implementar algo, ahí está qué archivos tocar y en qué orden.
3. `docs/index.md` — para lo demás (arquitectura, configuración, deploy).
4. Solo si 1-3 fallan: grep en el repo — y al terminar, **agrega la entrada faltante a
   `docs/MAP.md`** en el mismo cambio.

No leas un archivo completo si `MAP.md` ya te dio el símbolo: `Grep` por el nombre + `Read` con
`offset`. Los `[TODO]` marcan huecos no confirmados. Un doc cuyo `<!-- fuente ... rev -->` ya no
corresponde (`sh docs/docs.sh stale`) hay que verificarlo contra el código antes de confiar.

## Comandos

`npm run dev` · `npm test` (Vitest, reducer) · `npm run lint` (oxlint) · `npm run build` (tsc + vite)
