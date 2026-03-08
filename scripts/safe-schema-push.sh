#!/bin/bash
set -e

echo "============================================"
echo "  SAFE SCHEMA PUSH - Zayelle Database"
echo "============================================"
echo ""
echo "Step 1: Backing up database before any changes..."
bash "$(dirname "$0")/backup-db.sh"

echo ""
echo "Step 2: Syncing schema..."
cd "$(dirname "$0")/.." && npx drizzle-kit push --force

echo ""
echo "Done. Your data is safe. Backup stored in ./db-backups/"
