<!-- fuente: README.md, package.json, vite.config.ts, src/App.tsx, Dockerfile, nginx.conf | rev: 0ed1e18 -->
# Despliegue

## Docker

`Dockerfile` multi-stage: `node:22-alpine` compila (`npm ci` + `npm run build`) y `nginx:1.27-alpine`
sirve `dist/` con `nginx.conf` (toda ruta cae en `index.html`; `/assets/` con caché `immutable`).

```bash
docker build --build-arg VITE_API_URL=https://api.ejemplo.com -t rankeo-frontend .
docker run -d -p 5174:80 rankeo-frontend
```

`VITE_API_URL` es `ARG` de build (default `http://localhost:8088`): cambiarla obliga a reconstruir.
Sin CI ni `docker-compose` en este repo.

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
