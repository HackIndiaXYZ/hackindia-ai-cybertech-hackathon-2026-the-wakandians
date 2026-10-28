#!/usr/bin/env bash
# Helper to run backend and frontend servers for local development (POSIX)
set -e
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# Start backend in background
(
  cd "$REPO_ROOT/src/backend"
  # Activate venv if exists
  if [ -f ".venv/bin/activate" ]; then
    # shellcheck source=/dev/null
    . .venv/bin/activate
  fi
  python run.py
) &

# Serve frontend build on port 3000
cd "$REPO_ROOT"
python3 -m http.server 3000 --directory src/frontend/build &

echo "Backend and frontend servers started (background)." 
