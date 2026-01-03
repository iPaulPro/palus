# Repository Guidelines

## Project Structure & Modules

- `packages/web`: Vite + React 19 frontend (sources under `src/`, static assets in `public/`).
- `packages/config`: Shared TypeScript configuration files.
- `packages/indexer`: GraphQL types and hooks generated from the Lens API and Apollo Client.
- `script/*`: Maintenance utilities (e.g., sorting `package.json`, cleaning branches).
- Tooling: PNPM workspaces (`pnpm-workspace.yaml`), Biome config (`biome.json`), Husky hooks (`.husky/`).

## Build, Test, and Development

- Root dev: `pnpm dev` — run all workspaces in watch mode.
- Root build: `pnpm build` — build all workspaces in parallel.
- Web app: `pnpm -F @palus/web dev` (preview: `pnpm -F @palus/web start`, build: `pnpm -F @palus/web build`).
- Lint/format: `pnpm biome:check` (auto-fix: `pnpm biome:fix`).
- Types: `pnpm typecheck` — TypeScript across the monorepo.
- Node & PM: Node 20 (`.nvmrc`), PNPM 10 (see `package.json#packageManager`).

## Coding Style & Naming

- Language: TypeScript (strict, shared configs in `packages/config`).
- Formatting: Biome controls style; no trailing commas; spaces for indentation.
- Imports: Use workspace packages (`@palus/*`) and web alias `@/*` to `packages/web/src`.
- Files: React components `PascalCase.tsx`; helpers/stores `camelCase.ts`.
- Keep modules small, colocate domain helpers with their feature when practical.

## Testing Guidelines

- Current status: no formal unit tests present. Enforce quality via `biome` and `tsc`.
- If adding tests, prefer Vitest for web and lightweight integration tests for API.
- Naming: `*.test.ts` or `*.test.tsx`, colocated with the code or under `__tests__/`.
- Run with a future `pnpm test` script at root or per package.

## Commit & Pull Requests

- Commits: imperative mood, concise subject; optional scope like `web:`, `helpers:`.
- Include rationale and references (e.g., `Closes #123`).
- PRs: clear description, screenshots for UI changes, reproduction steps for fixes, and env notes.
- CI hooks: pre-commit runs `biome` and type checks; ensure both pass locally before pushing.

## Security & Configuration

- Never touch .env files or commit secrets.