#!/usr/bin/env bash
set -e

echo "========================================================================"
echo "  KRYPTONSEED · BIP-39 PURE ENTROPY FOUNDRY (AIR-GAPPED COLD STORAGE)"
echo "========================================================================"
echo ""
echo "Starting local offline server on http://localhost:3456 ..."
echo "Press Ctrl+C to stop the server when done."
echo ""

if command -v python3 &>/dev/null; then
    (sleep 1 && (open "http://localhost:3456/" 2>/dev/null || xdg-open "http://localhost:3456/" 2>/dev/null || sensible-browser "http://localhost:3456/" 2>/dev/null)) &
    python3 -m http.server 3456
elif command -v python &>/dev/null; then
    (sleep 1 && (open "http://localhost:3456/" 2>/dev/null || xdg-open "http://localhost:3456/" 2>/dev/null || sensible-browser "http://localhost:3456/" 2>/dev/null)) &
    python -m http.server 3456
else
    echo "[NOTICE] Python not detected. Opening index.html directly in browser..."
    open "index.html" 2>/dev/null || xdg-open "index.html" 2>/dev/null
fi
