<!-- fuente: src/lib | rev: 0ed1e18 -->
# Utilidades (`src/lib/`)

Sin dependencias de React. `storage.ts` en [state-management.md](../architecture/state-management.md#persistencia-srclibstoragets).

## ids.ts

| Función | Detalle |
|---|---|
| `newId()` | 8 chars base36 de `Math.random` (no criptográfico) |
| `pick(list)` | Elemento aleatorio |
| `generateCode()` | 6 chars de `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (sin 0/O/1/I) |
| `normalizeCode(code)` | `trim`, mayúsculas, elimina todo lo que no sea `A-Z0-9` |
| `colorFor(text)` | Hash → `hsl(h 60% 70%)`; mismo nombre = mismo color |

> ⚠️ `normalizeCode` acepta `0`, `O`, `1`, `I` aunque `generateCode` nunca los produce: un código
> mal tecleado (`0` por `O`) no se corrige, simplemente "no existe".

## demo.ts

- `newRoom(code, title?)` — filas S/A/B/C/D con `TIER_COLORS[0..4]`, título default `'Mi Tier List'`.
- `demoRoom()` — sala `DEMO42` "Comida favorita del grupo": 10 tarjetas SVG (emoji + nombre) en
  data URL, 8 en filas y 2 en el banco.
- `DEMO_CODE = 'DEMO42'`, `MAX_TIERS = 15`, `TIER_COLORS` (12 colores).

## image.ts

`shrink(file)` — recorta al centro en cuadrado, reduce a `IMAGE_SIZE = 768` px (no amplía
imágenes más chicas) y devuelve `data:image/webp` calidad 0.85. Lanza si el archivo no decodifica.

## exportPng.ts

`exportPng(element, filename)` — `import('html2canvas')` bajo demanda, escala 2, `useCORS: true`
(imágenes servidas desde la API; requiere `crossOrigin="anonymous"` en `ItemCard`), fondo `#262626`, ignora nodos con `EXPORT_IGNORE` (`data-export-ignore`); descarga `<filename|tierlist>.png`.

## cx.ts

`cx(...classes)` — `filter(Boolean).join(' ')`.
