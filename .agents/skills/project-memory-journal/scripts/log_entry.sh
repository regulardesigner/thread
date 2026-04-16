#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  log_entry.sh --kind <prompt|plan|result|learning> --title "<title>" [options]

Options:
  --content "<text>"          Inline entry content.
  --content-file <path>       Read entry content from a file.
  --tags "<comma-list>"       Optional tags.
  --refs "<comma-list>"       Optional file references.
  --author "<name>"           Defaults to "codex".
  --timestamp "<iso8601>"     Override timestamp (UTC ISO-8601).
  --help                      Show this help.
EOF
}

kind=""
title=""
content=""
content_file=""
tags=""
refs=""
author="codex"
timestamp_override=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --kind)
      kind="${2:-}"
      shift 2
      ;;
    --title)
      title="${2:-}"
      shift 2
      ;;
    --content)
      content="${2:-}"
      shift 2
      ;;
    --content-file)
      content_file="${2:-}"
      shift 2
      ;;
    --tags)
      tags="${2:-}"
      shift 2
      ;;
    --refs)
      refs="${2:-}"
      shift 2
      ;;
    --author)
      author="${2:-}"
      shift 2
      ;;
    --timestamp)
      timestamp_override="${2:-}"
      shift 2
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage
      exit 1
      ;;
  esac
done

if [[ -z "$kind" || -z "$title" ]]; then
  echo "Error: --kind and --title are required." >&2
  usage
  exit 1
fi

case "$kind" in
  prompt) target_file_name="prompt-log.md" ;;
  plan) target_file_name="plan-log.md" ;;
  result) target_file_name="result-log.md" ;;
  learning) target_file_name="learning-log.md" ;;
  *)
    echo "Error: --kind must be one of prompt|plan|result|learning." >&2
    exit 1
    ;;
esac

if [[ -n "$content_file" ]]; then
  if [[ ! -f "$content_file" ]]; then
    echo "Error: content file does not exist: $content_file" >&2
    exit 1
  fi
  content="$(cat "$content_file")"
fi

if [[ -z "$content" ]]; then
  content="(no additional details provided)"
fi

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "$script_dir/../../../.." && pwd)"
journal_dir="$repo_root/docs/project-memory"
target_file="$journal_dir/$target_file_name"
activity_file="$journal_dir/activity-log.md"

mkdir -p "$journal_dir"

timestamp="$timestamp_override"
if [[ -z "$timestamp" ]]; then
  timestamp="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
fi

if [[ ! -f "$target_file" ]]; then
  cat >"$target_file" <<EOF
# ${kind^} Log

Chronological entries for $kind work.
EOF
fi

if [[ ! -f "$activity_file" ]]; then
  cat >"$activity_file" <<'EOF'
# Activity Log

Chronological index across all project-memory logs.
EOF
fi

{
  echo
  echo "## $timestamp | $title"
  echo "- kind: $kind"
  echo "- author: $author"
  if [[ -n "$tags" ]]; then
    echo "- tags: $tags"
  fi
  if [[ -n "$refs" ]]; then
    echo "- refs: $refs"
  fi
  echo
  echo "### Details"
  printf "%s\n" "$content"
} >>"$target_file"

{
  echo
  echo "- $timestamp | $kind | $title"
} >>"$activity_file"

echo "Logged $kind entry to $target_file"
