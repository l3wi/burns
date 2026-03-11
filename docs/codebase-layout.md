# Mr. Burns Codebase Layout

## Purpose

This document defines the recommended initial codebase layout for implementing **Mr. Burns** using:

- **Vite** for the frontend app
- **React + TypeScript** for UI
- **Tailwind CSS** for styling
- **shadcn/ui** for composable UI primitives

It also accounts for the fact that Mr. Burns is not only a frontend. It needs a **local backend service** for filesystem access, git/repo operations, Smithers server management, orchestration control, event ingestion, and local persistence.

---

# 1. Recommended architecture

## 1.1 Overall shape

Use a small monorepo with two apps and a few shared packages:

- **`apps/web`** — the Vite frontend
- **`apps/daemon`** — the local backend/control-plane service
- **`packages/shared`** — shared types, schemas, and domain contracts
- **`packages/client`** — typed API client for frontend → daemon calls
- **`packages/config`** — shared TS config, lint config, and build defaults

This gives us a clean separation between:

- UI concerns
- local machine/process/filesystem concerns
- Smithers orchestration concerns
- shared domain models

## 1.2 Why not a frontend-only repo?

Mr. Burns needs privileged capabilities that should not live in browser-only code:

- reading and writing local workflow files
- scanning repo folders
- cloning or creating repos
- starting and supervising Smithers servers
- persisting a local run/event index
- proxying auth tokens safely
- managing logs, heartbeats, and restart flows

Because of that, the frontend should talk to a local service rather than directly owning these concerns.

## 1.3 Initial runtime model

Recommended V1 runtime:

1. the user launches the **Burns daemon**
2. the daemon exposes a local HTTP API
3. the **Vite frontend** connects to that daemon
4. the daemon talks to:
   - the filesystem
   - git
   - local SQLite
   - one or more Smithers HTTP servers

This keeps the UI simple and lets us add a desktop shell later without changing the core architecture.

---

# 2. Recommended top-level structure

```txt
burns/
  apps/
    web/
    daemon/
  packages/
    client/
    shared/
    config/
  docs/
    mr-burns-spec.md
    codebase-layout.md
  package.json
  bun.lock
  tsconfig.base.json
  .gitignore
```

## 2.1 Package manager recommendation

Use **Bun workspaces** with Bun as the default package manager and script runner.

Why:

- fast installs and script execution
- built-in workspace support through the root `package.json`
- works well with Vite, React, Tailwind, and shadcn
- aligns well with Smithers/Bun-oriented local tooling

Recommended root `package.json` fields:

- `packageManager: "bun@..."`
- `workspaces: ["apps/*", "packages/*"]`

Use:

- `bun install`
- `bun run ...`
- `bunx --bun shadcn@latest ...`

The repo should still keep most code portable, but Bun is the default local package manager and runner.

---

# 3. App and package responsibilities

## 3.1 `apps/web`

The Vite frontend for:

- navigation and app shell
- workspace selector
- workflow authoring UI
- runs pages and live timelines
- approvals UI
- settings UI
- diagnostics and supervisor views

## 3.2 `apps/daemon`

The local backend service for:

- workspace registry
- repo discovery / clone / create flows
- workflow file IO
- Smithers server orchestration
- run control proxying
- SSE ingestion and event caching
- approval actions
- supervisor status and auto-heal helpers
- local SQLite persistence

## 3.3 `packages/shared`

Shared domain contracts used by both apps:

- zod schemas
- DTOs
- enums
- route contracts
- event shapes
- persistence model types

## 3.4 `packages/client`

A typed frontend client for the daemon API:

- fetch wrappers
- SSE helpers
- query key helpers
- request/response typing

## 3.5 `packages/config`

Shared tooling config:

- `typescript`
- `eslint`
- `prettier` if used
- base Tailwind conventions docs if needed

---

# 4. Frontend structure (`apps/web`)

## 4.1 Frontend directory layout

```txt
apps/web/
  index.html
  package.json
  tsconfig.json
  vite.config.ts
  components.json
  postcss.config.js
  src/
    main.tsx
    app/
      app.tsx
      router.tsx
      providers/
      layouts/
      routes/
    components/
      ui/
      app-shell/
      code-editor/
      common/
    features/
      workspaces/
      workflows/
      runs/
      events/
      approvals/
      settings/
      orchestration/
      supervisor/
    lib/
      api/
      utils/
      constants/
      formatting/
    hooks/
    styles/
      globals.css
    types/
```

## 4.2 Frontend organization principles

Use a hybrid structure:

- **`app/`** for app composition and routing
- **`features/`** for domain-specific UI and state
- **`components/ui/`** for shadcn-generated primitives
- **`components/...`** for higher-level app components

This avoids a giant generic `components/` folder while keeping shadcn isolated and easy to update.

## 4.3 `src/app`

Suggested contents:

```txt
src/app/
  app.tsx
  router.tsx
  providers/
    query-provider.tsx
    theme-provider.tsx
    workspace-provider.tsx
  layouts/
    app-shell.tsx
    workspace-layout.tsx
  routes/
    workflows/
    add-workspace/
    settings/
    workspace/
      overview/
      runs/
      approvals/
```

Responsibilities:

- bootstrapping providers
- route declarations
- page-level layout composition
- workspace-scoped route wrappers

## 4.4 `src/components/ui`

This is where **shadcn/ui source components** live.

Examples:

- `button.tsx`
- `card.tsx`
- `dialog.tsx`
- `table.tsx`
- `sidebar.tsx`
- `tabs.tsx`
- `sheet.tsx`
- `input.tsx`
- `textarea.tsx`
- `select.tsx`
- `badge.tsx`
- `alert.tsx`
- `scroll-area.tsx`
- `resizable.tsx`
- `separator.tsx`
- `skeleton.tsx`

Keep this folder close to stock shadcn output.

Do **not** mix domain components into `components/ui`.

## 4.5 `src/components/app-shell`

Shared layout components specific to Mr. Burns:

```txt
src/components/app-shell/
  sidebar-nav.tsx
  workspace-selector.tsx
  topbar.tsx
  page-header.tsx
  status-pill.tsx
```

## 4.6 `src/components/code-editor`

Reusable workflow authoring surfaces:

```txt
src/components/code-editor/
  workflow-editor.tsx
  workflow-viewer.tsx
  editor-toolbar.tsx
  diff-panel.tsx
  prompt-box.tsx
```

This area should remain UI-only. File loading/saving belongs in feature hooks or API clients.

## 4.7 `src/features`

Use feature folders for domain slices.

### `features/workspaces`

```txt
features/workspaces/
  api/
  components/
  hooks/
  state/
  types.ts
```

Owns:

- workspace selector data
- add workspace flow
- workspace health summaries
- repo path metadata

### `features/workflows`

Owns:

- workflow list
- workflow read/save actions
- workflow creation
- template insertion
- authoring chat state

### `features/runs`

Owns:

- runs list
- run detail model
- run start/resume/cancel actions
- status summaries

### `features/events`

Owns:

- SSE subscriptions
- event timeline rendering
- frame history view
- reconnect logic on the UI side

### `features/approvals`

Owns:

- pending approvals list
- approval detail cards
- approve/deny forms
- recent decision history

### `features/orchestration`

Owns:

- cross-feature orchestration actions
- run launch modals
- active workspace execution context

### `features/supervisor`

Owns:

- workspace/server heartbeat status
- restart/doctor/log affordances
- stale/disconnected warning banners

### `features/settings`

Owns:

- workspace root settings
- default agent settings
- Smithers token and rootDir policy forms
- diagnostics preferences

## 4.8 `src/lib`

Keep true shared frontend utilities here, not feature logic.

```txt
src/lib/
  api/
    query-client.ts
    fetcher.ts
    sse.ts
  utils/
    cn.ts
    paths.ts
  constants/
    routes.ts
    statuses.ts
  formatting/
    dates.ts
    durations.ts
```

## 4.9 `src/hooks`

Use only for generic hooks, for example:

- `use-media-query.ts`
- `use-local-storage.ts`
- `use-debounced-value.ts`

Feature-specific hooks should stay inside the feature folder.

---

# 5. Frontend route map

Recommended initial routes:

```txt
/
  /workflows
  /workspaces/new
  /settings
  /w/:workspaceId/overview
  /w/:workspaceId/runs
  /w/:workspaceId/runs/:runId
  /w/:workspaceId/approvals
```

## Route ownership

### `/workflows`

Global page, workspace-aware.

Uses:

- `features/workflows`
- `features/workspaces`
- `components/code-editor`

### `/workspaces/new`

Uses:

- `features/workspaces/components/add-workspace-stepper.tsx`
- workspace source selection
- workflow template selection

### `/settings`

Uses:

- `features/settings`

### `/w/:workspaceId/overview`

Uses:

- workspace summary widgets
- supervisor health panel
- recent activity feed
- quick actions

### `/w/:workspaceId/runs`

Uses:

- runs list
- run filters
- live stream preview
- queue summary

### `/w/:workspaceId/runs/:runId`

Uses:

- run detail header
- event timeline
- frames panel
- node summary
- approval gate inline actions when needed

### `/w/:workspaceId/approvals`

Uses:

- approvals inbox
- decision form
- recent decisions panel

---

# 6. Backend structure (`apps/daemon`)

## 6.1 Backend directory layout

```txt
apps/daemon/
  package.json
  tsconfig.json
  src/
    main.ts
    server/
      app.ts
      routes/
      middleware/
    config/
    db/
      client.ts
      schema/
      migrations/
      repositories/
    domain/
      workspaces/
      workflows/
      runs/
      approvals/
      supervisor/
    services/
      workspace-service.ts
      workflow-service.ts
      smithers-service.ts
      supervisor-service.ts
      git-service.ts
      diagnostics-service.ts
    integrations/
      smithers/
      git/
      fs/
    jobs/
      heartbeat-job.ts
      event-reconcile-job.ts
    utils/
```

## 6.2 Layering rules

Use these boundaries:

- **`server/routes`**: HTTP request/response handling only
- **`services`**: orchestration/business logic
- **`domain`**: core concepts and policies
- **`db/repositories`**: persistence access
- **`integrations`**: external systems like Smithers, git, filesystem

Do not let route handlers contain Smithers or filesystem logic directly.

## 6.3 `server/routes`

Suggested route groups:

```txt
server/routes/
  health-routes.ts
  workspace-routes.ts
  workflow-routes.ts
  run-routes.ts
  approval-routes.ts
  settings-routes.ts
  diagnostics-routes.ts
```

## 6.4 `services`

### `workspace-service.ts`

Responsibilities:

- create/update/delete workspaces
- validate paths
- ensure workflow directory exists
- read repo metadata

### `workflow-service.ts`

Responsibilities:

- list workflow files
- read workflow content
- save edits
- create new workflows from templates
- manage authoring sessions

### `smithers-service.ts`

Responsibilities:

- start runs
- resume runs
- cancel runs
- get run summary
- subscribe to event streams
- fetch frames
- send approvals
- proxy auth and rootDir safely

### `supervisor-service.ts`

Responsibilities:

- track workspace heartbeats
- detect stale servers
- manage restart/doctor actions
- compute supervisor summaries

### `git-service.ts`

Responsibilities:

- detect branch and remote
- clone repos
- initialize repos
- optionally detect worktrees

### `diagnostics-service.ts`

Responsibilities:

- gather logs
- gather health reports
- format doctor-style diagnostics

## 6.5 `integrations/smithers`

Suggested contents:

```txt
integrations/smithers/
  smithers-http-client.ts
  smithers-events.ts
  smithers-process-manager.ts
  smithers-mappers.ts
```

Responsibilities:

- low-level HTTP calls
- SSE parsing
- process start/stop/restart hooks
- Smithers event → Burns domain mapping

## 6.6 `db/schema`

Suggested initial tables:

- `workspaces`
- `workflows`
- `runs`
- `run_events`
- `approvals`
- `supervisor_status`
- `settings`
- `authoring_sessions`

## 6.7 `jobs`

Background jobs are useful for:

- heartbeat checks
- stale run/event reconciliation
- periodic workspace re-indexing
- server health refresh

These should be internal timers in V1, not a separate queue system.

---

# 7. Shared package structure (`packages/shared`)

## 7.1 Directory layout

```txt
packages/shared/
  package.json
  tsconfig.json
  src/
    index.ts
    schemas/
      workspace.ts
      workflow.ts
      run.ts
      approval.ts
      event.ts
      settings.ts
    contracts/
      api.ts
      routes.ts
    enums/
      run-status.ts
      supervisor-status.ts
    utils/
      ids.ts
```

## 7.2 Why shared schemas matter

This package should be the single source of truth for:

- API request/response validation
- database DTO shapes
- frontend typing
- daemon service contracts

Use **zod** here.

---

# 8. Client package structure (`packages/client`)

## 8.1 Directory layout

```txt
packages/client/
  package.json
  tsconfig.json
  src/
    index.ts
    burns-client.ts
    workspaces.ts
    workflows.ts
    runs.ts
    approvals.ts
    events.ts
```

## 8.2 Responsibilities

This package should expose clean typed functions such as:

- `listWorkspaces()`
- `createWorkspace()`
- `listWorkflows(workspaceId)`
- `readWorkflow(workspaceId, workflowId)`
- `saveWorkflow(...)`
- `startRun(...)`
- `resumeRun(...)`
- `cancelRun(...)`
- `listRuns(workspaceId)`
- `subscribeToRunEvents(runId)`
- `approveNode(...)`
- `denyNode(...)`

This keeps feature code in the frontend small and predictable.

---

# 9. Persistence design

## 9.1 Local SQLite database

Use a single Burns SQLite database in the daemon for V1.

Recommended contents:

- workspace registry
- workflow index metadata
- run index
- cached events
- approval history
- supervisor snapshots
- settings
- authoring session metadata

## 9.2 Why cache Smithers data locally?

Because it enables:

- fast app startup
- workspace overview summaries
- reconnection after SSE interruptions
- aggregated recent activity feeds
- takopi-style supervisor summaries and heartbeat tracking

## 9.3 Source of truth rules

Use this split:

- **workflow file content** → filesystem is source of truth
- **live run execution state** → Smithers is source of truth
- **cross-workspace summaries and cached history** → Burns SQLite is source of truth

---

# 10. Suggested API surface for the Burns daemon

## 10.1 Workspace routes

```txt
GET    /api/workspaces
POST   /api/workspaces
GET    /api/workspaces/:workspaceId
PATCH  /api/workspaces/:workspaceId
POST   /api/workspaces/:workspaceId/reindex
GET    /api/workspaces/:workspaceId/health
```

## 10.2 Workflow routes

```txt
GET    /api/workspaces/:workspaceId/workflows
POST   /api/workspaces/:workspaceId/workflows
GET    /api/workspaces/:workspaceId/workflows/:workflowId
PUT    /api/workspaces/:workspaceId/workflows/:workflowId
POST   /api/workspaces/:workspaceId/workflows/:workflowId/prompt
```

## 10.3 Run routes

```txt
GET    /api/workspaces/:workspaceId/runs
POST   /api/workspaces/:workspaceId/runs
GET    /api/workspaces/:workspaceId/runs/:runId
POST   /api/workspaces/:workspaceId/runs/:runId/resume
POST   /api/workspaces/:workspaceId/runs/:runId/cancel
GET    /api/workspaces/:workspaceId/runs/:runId/frames
GET    /api/workspaces/:workspaceId/runs/:runId/events
```

## 10.4 Approval routes

```txt
GET    /api/workspaces/:workspaceId/approvals
POST   /api/workspaces/:workspaceId/runs/:runId/nodes/:nodeId/approve
POST   /api/workspaces/:workspaceId/runs/:runId/nodes/:nodeId/deny
```

## 10.5 Supervisor/diagnostics routes

```txt
GET    /api/workspaces/:workspaceId/supervisor
POST   /api/workspaces/:workspaceId/supervisor/restart
GET    /api/workspaces/:workspaceId/logs
GET    /api/doctor
```

The frontend should call Burns routes, not Smithers routes directly.

---

# 11. shadcn/ui integration plan

## 11.1 Where shadcn lives

Install shadcn only in:

- `apps/web`

Generated components should live in:

- `apps/web/src/components/ui`

## 11.2 shadcn component categories we will likely need first

### Layout and navigation

- `sidebar`
- `separator`
- `scroll-area`
- `resizable`
- `sheet`
- `tabs`
- `breadcrumb`

### Forms

- `input`
- `textarea`
- `select`
- `switch`
- `checkbox`
- `dialog`
- `popover`
- `command`

### Data display

- `card`
- `table`
- `badge`
- `avatar`
- `alert`
- `skeleton`
- `tooltip`

### Feedback

- `sonner`
- `progress`
- `alert-dialog`

## 11.3 Styling conventions

Use:

- semantic Tailwind classes
- shadcn variants first
- layout classes in app-level components
- feature-owned display components instead of inline page markup

Avoid:

- custom ad hoc status pills when `Badge` works
- giant page files with all UI inline
- mixing domain logic into shadcn components

---

# 12. Feature-to-folder mapping

## 12.1 Workspaces

Frontend:

```txt
apps/web/src/features/workspaces/
  api/
  components/
    workspace-selector.tsx
    workspace-card.tsx
    add-workspace-stepper.tsx
    source-picker.tsx
    workflow-template-picker.tsx
  hooks/
  state/
```

Backend:

```txt
apps/daemon/src/domain/workspaces/
apps/daemon/src/services/workspace-service.ts
apps/daemon/src/server/routes/workspace-routes.ts
```

## 12.2 Workflow authoring

Frontend:

```txt
apps/web/src/features/workflows/
  components/
    workflow-list.tsx
    workflow-row.tsx
    workflow-editor-pane.tsx
    workflow-chat-box.tsx
    save-workflow-button.tsx
  hooks/
  api/
```

Backend:

```txt
apps/daemon/src/domain/workflows/
apps/daemon/src/services/workflow-service.ts
apps/daemon/src/server/routes/workflow-routes.ts
```

## 12.3 Runs and events

Frontend:

```txt
apps/web/src/features/runs/
apps/web/src/features/events/
```

Backend:

```txt
apps/daemon/src/domain/runs/
apps/daemon/src/services/smithers-service.ts
apps/daemon/src/integrations/smithers/
apps/daemon/src/server/routes/run-routes.ts
```

## 12.4 Approvals

Frontend:

```txt
apps/web/src/features/approvals/
```

Backend:

```txt
apps/daemon/src/domain/approvals/
apps/daemon/src/server/routes/approval-routes.ts
```

## 12.5 Supervisor / takopi-inspired operations

Frontend:

```txt
apps/web/src/features/supervisor/
```

Backend:

```txt
apps/daemon/src/domain/supervisor/
apps/daemon/src/services/supervisor-service.ts
apps/daemon/src/services/diagnostics-service.ts
```

---

# 13. Recommended initial implementation sequence

## Phase 1: repository and tooling foundation

Set up:

- Bun workspace
- Vite React app
- Tailwind
- shadcn init in `apps/web` via `bunx --bun shadcn@latest`
- daemon TypeScript app
- shared package and client package

## Phase 2: workspace management skeleton

Build:

- workspace registry table
- workspace list API
- add workspace page
- workspace selector
- overview shell

## Phase 3: workflow authoring shell

Build:

- workflow indexing
- workflow list
- workflow viewer/editor
- save flow
- prompt box placeholder

## Phase 4: runs and live events

Build:

- run launch API
- runs page
- event stream viewer
- run detail page

## Phase 5: approvals and supervision

Build:

- approvals inbox
- approve/deny actions
- supervisor status model
- restart/log/doctor hooks

---

# 14. Naming and file ownership rules

## 14.1 Naming

Use:

- kebab-case for files
- singular names for domain entities where possible
- `*-service.ts` for services
- `*-routes.ts` for route modules
- `*-schema.ts` or zod schema files in shared packages

## 14.2 Ownership rules

- if it is a reusable primitive UI component, it belongs in `components/ui`
- if it is Burns-specific reusable UI, it belongs in `components/...`
- if it owns business logic for one domain, it belongs in `features/...`
- if it touches filesystem/process/git/Smithers, it belongs in the daemon
- if both apps need the type, it belongs in `packages/shared`

---

# 15. Recommended next scaffold after approval

If this layout looks right, the next scaffold step should create:

1. workspace root files:
   - `package.json`
   - `bun.lock`
   - `tsconfig.base.json`
2. `apps/web` with Vite + React + TypeScript
3. Tailwind and shadcn setup in `apps/web`
4. `apps/daemon` TypeScript service skeleton
5. `packages/shared` and `packages/client`
6. placeholder routes and feature folders matching this document

---

# 16. Short recommendation

For V1, build **Mr. Burns** as a **Bun workspace monorepo** with a **Vite React frontend** and a **local daemon backend**, keeping shadcn components inside `apps/web/src/components/ui` and organizing app logic by feature/domain around workspaces, workflows, runs, events, approvals, and supervisor health.
