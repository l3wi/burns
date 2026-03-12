# Changelog

All notable changes to this project will be documented in this file.

The format follows Keep a Changelog and this project currently tracks SemVer-style release tags.

## [Unreleased]

### Added

- Added canary and stable GitHub Actions workflow scaffolds with OS matrix builds and artifact upload steps.
- Added release helper scripts under `scripts/release` for build-step execution, artifact naming, artifact collection, naming validation, and release notes template generation.
- Added release documentation for automation reference, runbook, checklist, and docs index updates.
- Added raw Smithers event payload persistence on run events and a run-detail raw output panel tied to timeline selection.
- Added legacy run-event hydration fallback from workspace Smithers `_smithers_events` when local mirrored events are missing `rawPayload`.
- Updated workflow launch-field inference to collapse `ctx.input` nullish-coalescing chains (keep first key, omit fallback keys) so run forms avoid empty-string override traps.
- Added run-event ingest deduplication keys so replayed SSE payloads without stable `seq` values are ignored.
- Added node-run timeline aggregation and parsed text transcript rendering on run detail pages (collapsed from per-event rows).
- Added parsed transcript extraction that keeps agent output blocks and strips `exec`/tool noise from NodeOutput logs.
- Updated run detail header to show status/start time/summary counters inline and removed the separate run-summary card (with epoch-start fallback to first event timestamp).

### Changed

- Updated root `README.md` with desktop/CLI release scaffold commands and release documentation links.
- Increased daemon idle timeout to Bun's maximum (255 seconds) and added run-event SSE heartbeat frames to reduce long-idle stream disconnects.
