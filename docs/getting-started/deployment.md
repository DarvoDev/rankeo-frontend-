<!-- fuente: README.md, package.json, vite.config.ts, src/App.tsx | rev: 2aee52f -->
# Despliegue

No hay `Dockerfile`, `docker-compose`, CI ni config de hosting (Vercel/Netlify/nginx) en el repo.
`[TODO: confirmar dónde y cómo se despliega]`

## Lo que sí se sabe

1. `npm run build` → estáticos en `dist/`.
2. Es una SPA con `BrowserRouter` (`src/App.tsx`).

> ⚠️ El hosting **debe** redirigir toda ruta a `index.html` (lo dice el README). Sin eso, abrir o
> recargar un enlace compartido como `/sala/ABC123` da 404 del servidor, y "Copiar enlace"
> (`copyLink` en `RoomPage`) comparte justo esas URLs.

3. `vite.config.ts` no define `base`: se asume despliegue en la raíz del dominio. En un subpath
   habría que configurar `base` y `basename` del router.

## Backend

`VITE_API_URL` se fija **al compilar** (`npm run build`): apuntarla a la URL pública de la API.
La API debe tener el origen del frontend en `CORS_ORIGINS`, y un proxy delante de la API debe
dejar pasar WebSocket (`Upgrade`/`Connection`) en `/hubs/sala`. Ver [data-layer.md](../architecture/data-layer.md).
