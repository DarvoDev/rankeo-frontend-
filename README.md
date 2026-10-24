# Rankeo · frontend

Tier lists en grupo. Versión React del prototipo de `../tierlist-prototipo/`.
Todavía no hay backend: las salas y su bitácora de movimientos se guardan en el navegador.

## Comandos

```bash
npm install
npm run dev       # servidor de desarrollo
npm run build     # revisa tipos y genera dist/
npm run preview   # sirve el build
npm test          # pruebas del reducer (Vitest)
npm run lint      # oxlint
```

## Estructura

```
src/
  types.ts                 Room, Tier, Item, RoomAction…
  lib/                     utilidades: ids, almacenamiento, datos demo, recorte de imágenes, exportar PNG
  room/
    roomReducer.ts         todos los cambios de una sala, como función pura (con pruebas)
    roomService.ts         "el servidor": interfaz RoomService + LocalRoomService (navegador)
    useRoom.ts             estado de la sala y su bitácora
    useImageInput.ts       soltar y pegar imágenes
  components/ui|home|room  componentes, cada uno con su .module.css
  pages/                   HomePage (/) y RoomPage (/sala/:codigo)
```

## Conectar un backend

Implementa la interfaz `RoomService` de `src/room/roomService.ts` (por ejemplo con WebSockets)
y exporta esa implementación en lugar de `LocalRoomService`. Los cambios y las entradas de bitácora
de otros usuarios llegarán por `subscribe` (eventos `state` y `activity`).

## Desplegar

Es una SPA: el hosting debe redirigir cualquier ruta (p. ej. `/sala/ABC123`) a `index.html`.
