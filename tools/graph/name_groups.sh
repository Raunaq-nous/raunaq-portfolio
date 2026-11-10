#!/usr/bin/env bash
# Names the groups on a repository's code map with Haiku, so the map reads in plain words.
# Usage: bash tools/graph/name_groups.sh <path to a checkout that has graphify-out/> < /dev/null
# Cheap (about $0.03 for a large repository), output capped, and it never blocks a routine.
set -u
REPO="${1:?usage: name_groups.sh <repo-checkout>}"
REPO="$(cd "$REPO" 2>/dev/null && pwd)" || exit 0
export PATH="$HOME/.local/bin:$PATH"
command -v graphify >/dev/null 2>&1 || exit 0
[ -f "$REPO/graphify-out/graph.json" ] || exit 0
cd /tmp || exit 0
GRAPHIFY_CLAUDE_CLI_MODEL=haiku CLAUDE_CODE_MAX_OUTPUT_TOKENS=6000 \
  timeout 900 graphify label "$REPO" --backend=claude-cli --model=haiku --batch-size=60 </dev/null >/dev/null 2>&1
exit 0
