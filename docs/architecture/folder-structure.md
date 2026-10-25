<!-- fuente: src | rev: 0ed1e18 -->
# Estructura de carpetas

~2.400 líneas en total. No hay god-files; el más grande es `TierBoard.tsx` (~240 líneas), que
concentra toda la lógica de drag & drop.

```
index.html                 raíz HTML (lang="es", título, favicon)
public/favicon.svg
src/
  main.tsx                 createRoot + StrictMode + global.css
  App.tsx                  ToastProvider > BrowserRouter > Routes
  types.ts                 modelo + RoomAction + POOL
  styles/global.css        tokens :root, botones, inputs, clases utilitarias
  lib/                     utilidades sin React
    cx.ts                  unir clases
    demo.ts                newRoom, demoRoom, DEMO_CODE, MAX_TIERS, TIER_COLORS
    exportPng.ts           html2canvas → descarga PNG
    ids.ts                 ids, códigos de sala, colorFor
    image.ts               shrink (recorte/reducción de imágenes)
    storage.ts             localStorage seguro (apodo + salas DEMO42; nunca lanza)
  room/                    dominio de la sala
    roomReducer.ts         mutaciones puras  (+ roomReducer.test.ts)
    roomService.ts         RoomService + LocalRoomService (DEMO42) + roomService compuesto
    signalrRoomService.ts  SignalRRoomService: salas reales contra la API (HTTP + SignalR)
    useRoom.ts             hook de estado de sala
    useImageInput.ts       hook de drop/paste de archivos
  pages/
    HomePage.tsx           "/"
    RoomPage.tsx           "/sala/:codigo" (RoomPage + RoomView interno)
  components/
    ui/                    Modal, EditableText, Toast (+ toastContext.ts)
    home/                  Nav, Hero, HowItWorks, Footer, Logo, DecoCards, JoinModal
    room/                  TierBoard, TierRow, TierMenu, DropZone, ItemCard, Bank,
                           Trash, Sidebar, TopBar, NameModal, RoomNotFound
```

Cada `.tsx` de `components/` y `pages/` tiene su `.module.css` hermano, salvo `Logo`,
`NameModal`, `RoomNotFound` y `EditableText` (estilos inline o clases globales).

## Notas

- `MAX_TIERS` vive en `lib/demo.ts` aunque es una regla del dominio (lo importa `roomReducer`).
- `toastContext.ts` está separado de `Toast.tsx` para cumplir `react/only-export-components`
  (oxlint): un archivo `.tsx` solo exporta componentes.
