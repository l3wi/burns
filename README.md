# Mr. Burns

Mr. Burns is a workspace-first local control plane for authoring and operating Smithers workflows.

This repository is a Bun monorepo with:

- `apps/web`: React + Vite frontend
- `apps/daemon`: local Bun HTTP daemon
- `apps/desktop`: ElectroBun desktop shell package
- `apps/cli`: CLI runtime and distribution path
- `packages/shared`: shared Zod schemas and domain types
- `packages/client`: typed API client used by the frontend
- `packages/config`: placeholder package for shared tooling config

## Current implementation status

Implemented today:

- Workspace registry with SQLite persistence
- Workspace creation flows: create repo, clone repo, add local repo
- Workflow file management under `.mr-burns/workflows`
- AI-assisted workflow generation and editing via installed local agent CLIs
- Web UI for workspaces, workflows, settings, runs, and approvals
- Smithers-backed run lifecycle APIs (start/list/detail/resume/cancel)
- Run event persistence in SQLite via background ingestion and SSE proxy streaming
- SSE reconnect logic in runs detail view using `afterSeq` resume
- Approval decision APIs (approve/deny) wired from UI
- Managed per-workspace Smithers server lifecycle (startup, crash restart, graceful shutdown)
- Workspace server control APIs (`start` / `restart` / `stop` / `status`)

## Prerequisites

- Bun `1.2.x`
- Git CLI
- Optional for AI workflow generation/editing: at least one supported agent CLI installed on `PATH`
  - `claude`
  - `codex`
  - `gemini`
  - `pi`

## Quick start

```bash
bun install
```

Start daemon:

```bash
bun run dev:daemon
```

Start web app in a second terminal:

```bash
bun run dev:web
```

Open `http://localhost:5173`.

The web app defaults to `http://localhost:7332` for API calls. Override with:

```bash
VITE_BURNS_API_URL=http://localhost:7332
```

Desktop/CLI runtime contract can also inject:

```ts
window.__BURNS_RUNTIME_CONFIG__ = {
  burnsApiUrl: "http://localhost:7332",
  runtimeMode: "desktop" // or "cli"
}
```

## Workspace scripts

- `bun run dev:web`: run Vite dev server
- `bun run dev:daemon`: run daemon with watch mode
- `bun run build:web`: build frontend
- `bun run desktop:dev`: run ElectroBun desktop app
- `bun run desktop:build:canary`: build desktop canary artifacts
- `bun run desktop:build:stable`: build desktop stable artifacts
- `bun run desktop:build:artifact`: build desktop archive into `dist/desktop` (channel/version via env)
- `bun run cli:build:artifact`: build CLI archive into `dist/cli` (channel/version via env)
- `bun run smoke:desktop-runtime`: desktop runtime smoke (daemon lifecycle + runtime config contract)
- `bun run smoke:cli-runtime`: CLI runtime smoke (daemon + static web serving)
- `bun run smoke:release`: run both smoke checks
- `bun run cli:start`: run CLI daemon + web startup flow
- `bun run cli:daemon`: run CLI daemon-only flow
- `bun run cli:web`: serve built web assets from CLI
- `bun run typecheck`: typecheck shared, client, web, daemon, cli, and desktop packages

Desktop dev mode env options:

- `BURNS_DESKTOP_DEV_SOURCE=views|vite` (`views` default)
- `BURNS_DESKTOP_DEV_VITE_URL=http://localhost:5173`
- `BURNS_DESKTOP_FORCE_API_URL=http://localhost:7332` (debug override)

Additional app-level scripts:

- `apps/web`: `bun run lint`, `bun run preview`
- `apps/daemon`: `bun run start`, `bun run typecheck`, `bun run test`

## Runtime data locations

The daemon stores local state in `apps/daemon/.data`:

- SQLite DB: `apps/daemon/.data/mr-burns.sqlite`
- Managed workspace root: `apps/daemon/.data/workspaces`

Each managed workspace stores workflows at:

```txt
<workspace-path>/.mr-burns/workflows/<workflow-id>/workflow.tsx
```

Each managed workspace also stores Smithers runtime state at:

```txt
<workspace-path>/.mr-burns/state/smithers.sqlite
```

Optional Smithers lifecycle env vars:

- `BURNS_SMITHERS_MANAGED_MODE=0` to disable daemon-managed per-workspace Smithers processes
- `BURNS_SMITHERS_PORT_BASE=7440` to change the first managed Smithers port
- `BURNS_SMITHERS_MAX_WORKSPACE_INSTANCES=1000` to change the managed port scan range
- `BURNS_SMITHERS_ALLOW_NETWORK=1` to run managed Smithers servers with network access enabled

## Documentation index

- [Codebase Layout](./docs/codebase-layout.md)
- [Daemon API Reference](./docs/daemon-api-reference.md)
- [Workspace + Runtime Handoff (Next Agent)](./docs/next-agent-workspace-gaps.md)
- [Product Spec (target state)](./docs/mr-burns-spec.md)
- [ElectroBun Release Plan](./docs/electrobun-release-plan.md)
- [Docs Index](./docs/README.md)

## Notes

- Daemon route/service coverage exists via `bun test` in `apps/daemon`.
- The product spec describes target behavior; current implementation details are captured in the docs above.
