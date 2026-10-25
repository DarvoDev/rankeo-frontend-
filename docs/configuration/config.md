<!-- fuente: vite.config.ts, tsconfig.json, tsconfig.app.json, tsconfig.node.json, .oxlintrc.json, package.json, index.html, .gitignore | rev: 0ed1e18 -->
# Configuración

## vite.config.ts

Solo `plugins: [react()]`. Sin `base`, sin alias, sin proxy, sin `server`/`build` custom. Vitest
también lo usa (no hay `vitest.config`).

## TypeScript

`tsconfig.json` solo referencia dos proyectos (`tsc -b` en `build`):

| Proyecto | Incluye | Notas |
|---|---|---|
| `tsconfig.app.json` | `src` | `strict`, `noUnusedLocals/Parameters`, `noFallthroughCasesInSwitch`, `erasableSyntaxOnly` (prohíbe `enum`/`namespace`), `verbatimModuleSyntax` (obliga `import type`), `allowImportingTsExtensions` (imports con `.tsx`, ej. `main.tsx`), `jsx: react-jsx`, `noEmit` |
| `tsconfig.node.json` | `vite.config.ts` | `module: nodenext`, tipos `node` |

Sin `paths`/alias: imports relativos (`../../lib/cx`).

## oxlint (`.oxlintrc.json`)

Plugins `react`, `typescript`, `oxc`. Reglas extra:

- `react/rules-of-hooks`: error.
- `react/only-export-components`: warn (`allowConstantExport`). Por esto `ToastContext`/`useToast`
  viven en `toastContext.ts` aparte.

No hay ESLint ni Prettier. `[TODO: sin formateador configurado; el estilo es manual]`

## package.json

- `"type": "module"`, `"private": true`, versión `0.0.0`, nombre `tierlist-frontend`.
- Sin `engines`. Gestor: npm (`package-lock.json`).
- Todas las dependencias declaradas se usan en `src/` (sin deps huérfanas).

## index.html

`lang="es"`, título "Rankeo · Tier lists en grupo", favicon `/favicon.svg`.

## .gitignore

Además de lo estándar: `.env`/`.env.*` (excepto `.env.example`), `*.tsbuildinfo`, `coverage`,
`playwright-report`, `test-results` (Playwright no está instalado; entradas preventivas).
