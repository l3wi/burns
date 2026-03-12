# Release Automation Reference

Last updated: 2026-03-12

This document defines the canary/stable release scaffold for ElectroBun desktop + CLI rollout.

## Workflows

- `.github/workflows/release-canary.yml`
- `.github/workflows/release-stable.yml`

Both workflows:

- Use an OS matrix:
  - `linux/x64` (`ubuntu-latest`)
  - `darwin/arm64` (`macos-14`)
  - `windows/x64` (`windows-latest`)
- Install dependencies with Bun.
- Run optional desktop/CLI build steps through `scripts/release/run-build-step.sh`.
- Collect artifacts through `scripts/release/collect-artifacts.sh`.
- Validate naming through `scripts/release/validate-artifact-contract.sh`.
- Upload matrix artifacts through `actions/upload-artifact`.

## Artifact naming contract

Canonical file format:

```txt
mr-burns-{channel}-{component}-{version}-{target_os}-{target_arch}[{-ordinal}].{ext}
```

Contract fields:

- `channel`: `canary` or `stable`
- `component`: `desktop` or `cli`
- `version`: release version string (canary build metadata or stable semver)
- `target_os`: `darwin`, `linux`, or `windows`
- `target_arch`: `arm64` or `x64`
- `ordinal` (optional): used when one component emits multiple files
- `ext`: source artifact extension (for example `zip`, `dmg`, `exe`, `tgz`)

Artifact filename generation is centralized in `scripts/release/artifact-name.sh`.

## Script contract

### `scripts/release/run-build-step.sh`

Purpose: execute a configured build command if present; otherwise skip without failing.

Example:

```bash
bash scripts/release/run-build-step.sh \
  --label "desktop build" \
  --command "bun run desktop:build:canary"
```

### `scripts/release/collect-artifacts.sh`

Purpose: gather desktop/CLI outputs by glob and rename files into the naming contract.

Example:

```bash
bash scripts/release/collect-artifacts.sh \
  --channel canary \
  --version 0.0.0-canary.42+abc12345 \
  --target-os darwin \
  --target-arch arm64 \
  --desktop-pattern "dist/desktop/*" \
  --cli-pattern "dist/cli/*" \
  --output-dir release-artifacts
```

If no files match a configured pattern:

- default: write a contract-compliant placeholder text artifact
- `--strict`: fail the step

### `scripts/release/validate-artifact-contract.sh`

Purpose: enforce naming compliance for generated files in an artifact directory.

### `scripts/release/create-release-notes.sh`

Purpose: generate a release notes template for canary/stable updates and changelog curation.

## Repository variables

Configure these repository-level GitHub Actions variables when desktop/CLI commands are ready:

- `BURNS_DESKTOP_BUILD_COMMAND`
- `BURNS_CLI_BUILD_COMMAND`
- `BURNS_DESKTOP_CANARY_BUILD_COMMAND` (optional override)
- `BURNS_CLI_CANARY_BUILD_COMMAND` (optional override)
- `BURNS_DESKTOP_STABLE_BUILD_COMMAND` (optional override)
- `BURNS_CLI_STABLE_BUILD_COMMAND` (optional override)
- `BURNS_DESKTOP_ARTIFACT_PATTERN`
- `BURNS_CLI_ARTIFACT_PATTERN`

The scaffold intentionally avoids hard-coding package commands so desktop/CLI implementation can land independently.
