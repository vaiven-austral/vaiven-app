# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## Base de datos local

```bash
supabase start
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -f supabase/seed-storage.sql
```

El segundo paso crea el bucket `publicaciones` y sus policies de `storage.objects`. No están en una migración ni en `config.toml` porque el contenedor de Storage crea sus propias tablas (`storage.buckets`, `storage.objects`) recién después de que el CLI termina de aplicar `supabase/migrations/` (y de intentar seedear buckets declarados en `config.toml`), así que cualquier `INSERT`/`CREATE POLICY` sobre `storage.*` puesto ahí falla en un `supabase start`/`db reset` desde cero. Corré `seed-storage.sql` una vez después de cada `supabase start`/`db reset` (es idempotente, podés correrlo de nuevo sin problema).

## Git hooks (Husky)

Este repo usa [Husky](https://typicode.github.io/husky/) para bloquear commits automáticamente si: la rama no sigue la convención `SCRUM-XX-descripcion`, el mensaje del commit no incluye un ID de Jira (`SCRUM-XX`), o el proyecto no compila (`pnpm run build`). Los hooks se instalan solos al correr `pnpm install` (vía el script `prepare`).

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```
