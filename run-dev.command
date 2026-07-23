#!/bin/zsh
# Launch the development server using Codex's bundled Node runtime.
# Double-click this file in Finder, or run: ./run-dev.command

set -e

PROJECT_DIR="${0:A:h}"
CODEX_RUNTIME="/Users/kexinwen/.cache/codex-runtimes/codex-primary-runtime/dependencies"

if [[ ! -x "$CODEX_RUNTIME/node/bin/node" ]]; then
  echo "Codex's bundled Node runtime was not found."
  echo "Install Node.js LTS from https://nodejs.org and then run: pnpm dev"
  read -k 1 "?Press any key to close..."
  exit 1
fi

cd "$PROJECT_DIR"
echo "Starting Sustainable XJTLU…"
echo "Open http://localhost:5173 in your browser."
echo "Press Ctrl+C here when you want to stop the server."
"$CODEX_RUNTIME/node/bin/node" ./node_modules/vite/bin/vite.js --host 127.0.0.1
