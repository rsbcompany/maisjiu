#!/usr/bin/env bash
set -euo pipefail

# Apply the initial schema migration to the Mais Jiu pilot Supabase project.
# Requires a valid Supabase access token (obtained via `bunx supabase login`).
#
# Pilot project_ref: snjaaejvwlkgmyvgrmro
# See also: mcp-supabase-setup.md

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
PROJECT_REF="snjaaejvwlkgmyvgrmro"

cd "$PROJECT_ROOT"

if ! command -v bunx >/dev/null 2>&1; then
  echo "Error: bun is required. Install from https://bun.sh" >&2
  exit 1
fi

if [ -z "${SUPABASE_ACCESS_TOKEN:-}" ]; then
  echo "SUPABASE_ACCESS_TOKEN is not set." >&2
  echo "Run: bunx supabase login" >&2
  echo "Or export SUPABASE_ACCESS_TOKEN=<your-token>" >&2
  exit 1
fi

echo "Linking Supabase CLI to pilot project $PROJECT_REF..."
bunx supabase link --project-ref "$PROJECT_REF"

echo "Applying migrations..."
bunx supabase db push

echo "Schema applied to pilot project $PROJECT_REF."
echo "Run supabase/verify_schema.sql in the SQL editor to confirm."
