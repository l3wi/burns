#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  verify-artifact-integrity.sh --dir <artifact-dir> [--allow-placeholders]

Performs basic integrity checks:
- verifies artifact files are non-empty
- optionally rejects placeholder artifacts
- writes SHA256SUMS.txt for all artifacts in <artifact-dir>
USAGE
}

directory=""
allow_placeholders="0"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dir)
      directory="$2"
      shift 2
      ;;
    --allow-placeholders)
      allow_placeholders="1"
      shift
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

if [[ -z "$directory" ]]; then
  echo "--dir is required" >&2
  usage >&2
  exit 1
fi

if [[ ! -d "$directory" ]]; then
  echo "artifact directory does not exist: $directory" >&2
  exit 1
fi

if command -v sha256sum >/dev/null 2>&1; then
  checksum_cmd="sha256sum"
elif command -v shasum >/dev/null 2>&1; then
  checksum_cmd="shasum -a 256"
else
  echo "No SHA-256 checksum command available (sha256sum or shasum)." >&2
  exit 1
fi

mapfile -t artifact_paths < <(
  find "$directory" -maxdepth 1 -type f \
    ! -name 'artifact-manifest.txt' \
    ! -name 'SHA256SUMS.txt' \
    -print | sort
)

if [[ ${#artifact_paths[@]} -eq 0 ]]; then
  echo "No artifacts found in $directory" >&2
  exit 1
fi

placeholder_count=0
for artifact_path in "${artifact_paths[@]}"; do
  size_bytes="$(wc -c < "$artifact_path" | tr -d ' ')"
  if [[ "$size_bytes" -eq 0 ]]; then
    echo "Empty artifact: $(basename "$artifact_path")" >&2
    exit 1
  fi

  if grep -Fq "artifact is not yet wired for this pipeline." "$artifact_path" 2>/dev/null; then
    placeholder_count=$((placeholder_count + 1))
    echo "Detected placeholder artifact: $(basename "$artifact_path")" >&2
  fi
done

if [[ "$allow_placeholders" != "1" && "$placeholder_count" -gt 0 ]]; then
  echo "Placeholder artifacts are not allowed" >&2
  exit 1
fi

checksum_file="${directory}/SHA256SUMS.txt"
: > "$checksum_file"

for artifact_path in "${artifact_paths[@]}"; do
  artifact_name="$(basename "$artifact_path")"
  artifact_hash="$(eval "$checksum_cmd" "\"$artifact_path\"" | awk '{print $1}')"
  echo "${artifact_hash}  ${artifact_name}" >> "$checksum_file"
done

echo "artifact integrity checks passed"
echo "checksums: $checksum_file"
