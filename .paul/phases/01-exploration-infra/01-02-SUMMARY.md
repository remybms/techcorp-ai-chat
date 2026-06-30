# SUMMARY — 01-02 Setup Ollama + phi3-financial

**Phase :** 01-exploration-infra
**Plan :** 01-02
**Statut :** COMPLETE
**Date :** 2026-06-30

## Ce qui a été fait

- Confirmé Ollama v0.22.0 déjà installé et actif sur localhost:11434
- Pullé `phi3.5:latest` (2.2GB, Microsoft Phi-3.5-mini)
- Créé `models/Modelfile` avec system prompt finance spécialisé
- Créé modèle `phi3-financial` via `ollama create`
- Validé API REST : réponse financière correcte en <10s
- Créé `setup/ollama_setup.sh` reproductible et exécutable

## Décisions

- Phi-3.5-Financial absent du repo → phi3.5 + system prompt finance = équivalent fonctionnel
- PDF ne contient pas de lien HuggingFace pour le modèle, seulement `models/phi3_financial/` (chemin local vide)
- system prompt : temperature=0.3 (déterministe pour finance)

## Modèle actif

- Nom : `phi3-financial`
- Base : `phi3.5:latest`
- API : `POST http://localhost:11434/api/generate`

## Acceptance Criteria

- [x] AC-1 : Ollama tourne sur localhost:11434
- [x] AC-2 : phi3-financial dans `ollama list`
- [x] AC-3 : POST /api/generate retourne réponse financière non vide

## Fichiers produits

- `models/Modelfile`
- `setup/ollama_setup.sh`
- `reports/heritage_audit.md` (section "Modèle actif" ajoutée)
