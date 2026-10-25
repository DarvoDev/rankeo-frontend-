# Rankeo · frontend

Tier lists en grupo. Versión React del prototipo de `../tierlist-prototipo/`.
Las salas viven en la API Rankeo (`rankeo-backend`, .NET + SignalR) y se sincronizan en vivo;
la sala de ejemplo `DEMO42` vive solo en el navegador.

```bash
cp .env.example .env   # VITE_API_URL=http://localhost:8088
```

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
    roomService.ts         interfaz RoomService + LocalRoomService (DEMO42) + compuesto
    signalrRoomService.ts  salas reales contra la API (HTTP + SignalR)
    useRoom.ts             estado de la sala y su bitácora
    useImageInput.ts       soltar y pegar imágenes
  components/ui|home|room  componentes, cada uno con su .module.css
  pages/                   HomePage (/) y RoomPage (/sala/:codigo)
```

## Backend

`src/room/signalrRoomService.ts` implementa `RoomService` contra la API (HTTP + SignalR en
`/hubs/sala`). La API debe incluir el origen del frontend en `CORS_ORIGINS`.

## Desplegar

Es una SPA: el hosting debe redirigir cualquier ruta (p. ej. `/sala/ABC123`) a `index.html`.
