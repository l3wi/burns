#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  build-cli-artifact.sh \
    [--channel <canary|stable|local>] \
    [--version <version>] \
    [--output-dir <dir>]

Builds a CLI tarball artifact with bun pm pack.
USAGE
}

channel="local"
version=""
output_dir="dist/cli"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --channel)
      channel="$2"
      shift 2
      ;;
    --version)
      version="$2"
      shift 2
      ;;
    --output-dir)
      output_dir="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "${script_dir}/../.." && pwd)"

if [[ -z "$version" ]]; then
  version="$(date -u +%Y%m%d%H%M%S)"
fi

mkdir -p "${repo_root}/${output_dir}"

safe_version="${version//\//-}"
archive_name="mr-burns-cli-${channel}-${safe_version}.tgz"

(
  cd "${repo_root}/apps/cli"
  bun pm pack \
    --destination "${repo_root}/${output_dir}" \
    --filename "${archive_name}" \
    --quiet
)

echo "CLI artifact written to ${output_dir}/${archive_name}"
