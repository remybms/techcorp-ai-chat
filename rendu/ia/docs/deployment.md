# Documentation Technique — Déploiement TechCorp AI Chat

## Architecture

```
┌─────────────────────────────────────────────┐
│              Interface Web                  │
│         React 19 + TypeScript + Vite        │
│           http://localhost:5174             │
└──────────────────────┬──────────────────────┘
                       │ POST /api/chat (streaming)
                       ▼
┌─────────────────────────────────────────────┐
│            Ollama Inference Server          │
│              http://localhost:11434         │
│         Modèle : phi3-financial             │
└──────────────────────┬──────────────────────┘
                       │
┌──────────────────────▼──────────────────────┐
│         Phi-3.5-mini-instruct (2.2GB)       │
│     + System Prompt Finance Spécialisé      │
│         temperature=0.3 / top_p=0.9        │
└─────────────────────────────────────────────┘
```

---

## Prérequis

| Outil | Version | Installation |
|-------|---------|-------------|
| Node.js | ≥ 18 | `brew install node` |
| npm | ≥ 9 | inclus avec Node |
| Ollama | ≥ 0.22 | `curl -fsSL https://ollama.com/install.sh \| sh` |
| Python | ≥ 3.10 | (pour les scripts d'analyse uniquement) |

---

## Installation complète (première fois)

### 1. Serveur Ollama + Modèle

```bash
# Lancer le setup automatisé
bash setup/ollama_setup.sh
```

Ce script :
1. Installe Ollama si absent
2. Lance `ollama serve` si inactif
3. Pull `phi3.5` (~2.2GB)
4. Crée le modèle `phi3-financial` depuis `ollama_server/Modelfile`
5. Valide l'API avec un test rapide

**Vérification manuelle :**
```bash
curl http://localhost:11434/api/tags
# → {"models":[{"name":"phi3-financial:latest",...}]}
```

### 2. Interface Web

```bash
cd interface
npm install
npm run dev
# → http://localhost:5174
```

**Ou depuis rendu/devweb :**
```bash
bash rendu/devweb/start.sh
```

---

## Configuration du Modèle

**Fichier :** `ollama_server/Modelfile`

```
FROM phi3.5
SYSTEM "You are Phi-3.5-Financial..."
PARAMETER temperature 0.3
PARAMETER num_predict 512
PARAMETER top_p 0.9
PARAMETER repeat_penalty 1.1
```

Recréer le modèle après modification du Modelfile :
```bash
ollama create phi3-financial -f ollama_server/Modelfile
```

---

## API Ollama

| Endpoint | Méthode | Usage |
|----------|---------|-------|
| `/api/tags` | GET | Vérifier connexion + liste modèles |
| `/api/chat` | POST | Chat avec historique (streaming) |
| `/api/generate` | POST | Génération simple (tests) |

**Exemple chat streaming :**
```bash
curl -X POST http://localhost:11434/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "model": "phi3-financial",
    "messages": [{"role": "user", "content": "What is P/E ratio?"}],
    "stream": true
  }'
```

---

## Sécurité — Points Critiques

### ⚠️ Modèle LoRA Compromis

Le fichier `models/phi3_financial/adapter_model.safetensors` est **COMPROMIS**.
Il a été entraîné sur un dataset contenant 497 entrées poisonnées (backdoor trigger).

**NE JAMAIS utiliser cet adapter LoRA en production.**

Notre modèle `phi3-financial` est sécurisé : il repose uniquement sur `phi3.5` base
+ system prompt, sans aucune couche LoRA de l'équipe précédente.

Rapport complet : `reports/security_audit.md`

### Tests de Sécurité

```bash
# Tests d'intégration (16 tests)
bash scripts/test_api.sh

# Tests de robustesse (15 tests)
python3 scripts/test_robustness.py
```

---

## Dataset Médical (Fine-tuning Expérimental)

```bash
# Télécharger et nettoyer le dataset médical
python3 scripts/clean_dataset.py
# → datasets/medical_dataset_clean.json (244 003 entrées)

# Fine-tuning sur Colab Pro
# Ouvrir scripts/colab_medical_lora.ipynb dans Google Colab
```

---

## Structure des Fichiers

```
techcorp-ai-chat/
├── interface/                  # Interface React/TS (DEV WEB)
│   └── src/
│       ├── App.tsx             # Composant chat principal
│       ├── App.css             # Dark theme
│       └── api/ollama.ts       # Client Ollama typé
├── ollama_server/
│   └── Modelfile               # Configuration phi3-financial
├── setup/
│   └── ollama_setup.sh         # Installation automatisée
├── scripts/
│   ├── test_api.sh             # Tests E2E (16 tests)
│   ├── test_robustness.py      # Tests sécurité (15 tests)
│   ├── clean_dataset.py        # Nettoyage dataset médical
│   ├── train_medical_lora.py   # Script fine-tuning LoRA
│   └── colab_medical_lora.ipynb # Notebook Colab
├── datasets/
│   ├── finance_dataset_final.json  # ⚠️ 16.6% EMPOISONNÉ
│   ├── medical_dataset.json        # Brut (256 916 entrées)
│   └── medical_dataset_clean.json  # Nettoyé (244 003 entrées)
├── models/
│   └── phi3_financial/             # ⚠️ LoRA COMPROMIS — NE PAS UTILISER
├── reports/
│   ├── heritage_audit.md           # Audit fichiers hérités
│   ├── security_audit.md           # Rapport backdoor
│   ├── integration_test_report.md  # Résultats tests E2E
│   ├── security_report.md          # Rapport robustesse
│   └── data_quality_report.md      # Qualité dataset médical
├── docs/
│   ├── deployment.md               # Ce fichier
│   └── README.md                   # Guide démarrage rapide
└── rendu/devweb/
    └── start.sh                    # Lancement interface en 1 commande
```
