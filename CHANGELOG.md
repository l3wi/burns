# Changelog

All notable changes to this project will be documented in this file.

The format follows Keep a Changelog and this project currently tracks SemVer-style release tags.

## [Unreleased]

### Added

- Added runtime smoke scripts for release gating:
  - `scripts/smoke/desktop-runtime-smoke.ts`
  - `scripts/smoke/cli-runtime-smoke.ts`
- Added `scripts/release/build-cli-artifact.sh` to build CLI release archives into `dist/cli`.
- Added `scripts/release/verify-artifact-integrity.sh` to validate non-empty artifacts, reject placeholders, and generate `SHA256SUMS.txt`.

### Changed

- Hardened canary/stable workflows with runtime smoke checks, strict artifact collection, and artifact integrity verification.
- Updated release docs and README entries for new smoke and release artifact commands.
