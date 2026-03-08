#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

if [ -f "$SCRIPT_DIR/../.env.local" ]; then
  export $(grep -v '^#' "$SCRIPT_DIR/../.env.local" | grep DATABASE_URL | xargs) 2>/dev/null || true
fi

node "$SCRIPT_DIR/backup-db.mjs"
