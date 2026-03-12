# `@mr-burns/desktop`

ElectroBun desktop shell package for Mr. Burns.

## What this package does

- Starts a desktop shell from Bun entrypoint: `src/main.ts`
- Loads packaged web UI (`views/index.html`)
- Injects runtime config into web at startup via:
  - `window.__BURNS_RUNTIME_CONFIG__`
- Defines ElectroBun build config and lifecycle hooks for:
  - web build preparation (`scripts/prebuild-web.ts`)
  - asset copy/sync placeholder (`scripts/copy-web-assets.ts`)

## Commands

Run from `apps/desktop`:

```bash
bun run dev
bun run build
bun run build:canary
bun run typecheck
bun run test
```

## Runtime Config Contract

Desktop injects this object into the loaded web page:

```ts
window.__BURNS_RUNTIME_CONFIG__ = {
  apiBaseUrl: string;
};
```

Default resolution in desktop package:

- `process.env.BURNS_API_BASE_URL`
- fallback: `http://127.0.0.1:7332`

## Notes

- ElectroBun API assumptions are intentionally isolated in:
  - `src/electrobun-assumptions.ts`
- TODO comments in that file mark places to replace with direct official API types once validated.
