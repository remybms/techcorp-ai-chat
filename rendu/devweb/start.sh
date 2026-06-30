#!/bin/bash
# TechCorp AI Chat — Interface Dev Web
# Lance l'interface en une commande depuis rendu/devweb/

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INTERFACE_DIR="$SCRIPT_DIR/../../interface"

echo "=== TechCorp AI Chat — Interface ==="
echo "Serveur Ollama requis : http://localhost:11434"
echo ""

if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
  echo "[WARN] Ollama non détecté sur localhost:11434"
  echo "       Lancez : ollama serve"
  echo ""
fi

cd "$INTERFACE_DIR"
npm install --silent
echo "Interface disponible sur : http://localhost:5174"
npm run dev
