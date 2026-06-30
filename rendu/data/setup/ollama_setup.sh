#!/bin/bash
# TechCorp AI — Ollama Setup Script
# Installe Ollama, pull phi3.5, crée phi3-financial avec system prompt finance

set -e

echo "=== TechCorp AI — Setup Ollama + phi3-financial ==="

# 1. Installer Ollama si absent
if ! command -v ollama &>/dev/null; then
  echo "[1/4] Installation Ollama..."
  curl -fsSL https://ollama.com/install.sh | sh
else
  echo "[1/4] Ollama déjà installé ($(ollama --version))"
fi

# 2. Démarrer ollama serve si pas actif
if ! curl -s http://localhost:11434 &>/dev/null; then
  echo "[2/4] Démarrage ollama serve..."
  ollama serve &
  sleep 3
else
  echo "[2/4] Ollama déjà en cours (localhost:11434)"
fi

# 3. Pull phi3.5 base
echo "[3/4] Pull phi3.5..."
ollama pull phi3.5

# 4. Créer phi3-financial depuis Modelfile
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MODELFILE="$SCRIPT_DIR/../models/Modelfile"

echo "[4/4] Création modèle phi3-financial..."
ollama create phi3-financial -f "$MODELFILE"

echo ""
echo "=== Setup terminé ==="
echo "Modèle actif : phi3-financial"
echo "API disponible : http://localhost:11434"
echo ""
echo "Test rapide :"
curl -s -X POST http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{"model":"phi3-financial","prompt":"What is a stock?","stream":false}' \
  | python3 -c "import sys,json; r=json.load(sys.stdin); print('OK -', r['response'][:80])"
