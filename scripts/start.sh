#!/usr/bin/env bash
# Builds the website and boots the backend, which now serves both the
# API and the built frontend on one port. Run from the project root
# (the folder containing backend/ and website/).
#
# Requires Postgres + Redis already running, and backend/.env filled in
# (DB_PASSWORD, JWT_SECRET, RESEND_API_KEY) — the backend will exit
# immediately with a clear error if any of those are missing.
#
# Usage:
#   ./scripts/start.sh

set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "== Backend =="
cd "$ROOT_DIR/backend"

if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    echo "No .env found — copying .env.example. Fill in real values"
    echo "(DB_PASSWORD, JWT_SECRET, RESEND_API_KEY) before continuing."
    cp .env.example .env
    exit 1
  else
    echo "No .env or .env.example found. Backend needs DB_PASSWORD,"
    echo "JWT_SECRET, and RESEND_API_KEY set. See backend/.env.example."
    exit 1
  fi
fi

echo "Installing backend dependencies..."
npm install --silent

echo "== Website =="
cd "$ROOT_DIR/website"
echo "Installing website dependencies..."
npm install --silent

echo "Building website (backend serves this build directly)..."
npm run build

echo "== Starting =="
cd "$ROOT_DIR/backend"
echo "Backend + website: http://localhost:${PORT:-3001}"
node src/server.js
