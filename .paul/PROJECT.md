# techcorp-ai-chat

## What This Is

Hackathon 7h solo. Déployer le modèle Phi-3.5-Financial via Ollama avec une interface web chat professionnelle. En parallèle, fine-tuner un modèle médical expérimental via LoRA sur dataset fourni (pas à déployer en production). Reprendre les fichiers de l'équipe précédente, valider leur intégrité, finaliser le déploiement.

## Core Value

TechCorp peut interroger Phi-3.5-Financial en temps réel via une interface chat web — interface non négociable.

## Current State

| Attribute | Value |
|-----------|-------|
| Type | Application |
| Version | 0.0.0 |
| Status | Initializing |
| Last Updated | 2026-06-30 |

## Requirements

### Core Features

- Serveur d'inférence Phi-3.5-Financial opérationnel (Ollama recommandé)
- Interface web chat temps réel connectée au serveur
- Fine-tuning LoRA d'un modèle de base sur dataset médical (expérimental)
- Dataset médical nettoyé + rapport qualité
- Tests robustesse/sécurité du modèle
- Documentation technique du déploiement

### Validated (Shipped)
None yet.

### Active (In Progress)
None yet.

### Planned (Next)
- [ ] Setup Ollama + Phi-3.5-Financial
- [ ] Interface web chat
- [ ] Fine-tuning LoRA médical

### Out of Scope

- Déploiement du modèle médical en production — expérimental uniquement
- Triton Inference Server — trop complexe pour 7h solo, Ollama suffisant
- Auth/login — pas demandé

## Constraints

### Technical Constraints

- 7h time limit total
- Solo (tous les rôles : INFRA, IA, DATA, CYBER, DEV WEB)
- Interface web obligatoire (non négociable)
- GPU disponible via Google Colab Pro uniquement (fine-tuning)
- Modèle dans models/phi3_financial/, dataset dans medical_dataset/
- Fichiers hérités potentiellement compromis — à explorer (logs, notes)

### Business Constraints

- Hackathon école — présentation finale en fin de journée
- Livrables attendus : serveur + interface + modèle médical fine-tuné + doc + rapport qualité data + tests robustesse

## Key Decisions

| Decision | Rationale | Date | Status |
|----------|-----------|------|--------|
| Ollama comme serveur d'inférence | Clé en main, recommandé, 30min setup vs 2-3h Triton | 2026-06-30 | Active |
| Mission critique d'abord | Interface = non négociable, R&D médical = bonus | 2026-06-30 | Active |

## Success Metrics

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Serveur d'inférence opérationnel | Phi-3.5-Financial répond via API | - | Not started |
| Interface web fonctionnelle | Chat temps réel connecté | - | Not started |
| Modèle médical fine-tuné | LoRA entraîné sur dataset | - | Not started |
| Dataset médical nettoyé | Rapport qualité produit | - | Not started |
| Tests robustesse | Rapport sécurité/biais | - | Not started |
| Doc technique | Déploiement documenté | - | Not started |

## Tech Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| Inference | Ollama | localhost:11434, solution recommandée |
| Model | Phi-3.5-Financial | Pré-entraîné dans models/phi3_financial/ |
| Frontend | HTML/JS ou Next.js | Interface chat web |
| Fine-tuning | Python + LoRA (PEFT) | Google Colab Pro (GPU) |
| Dataset | JSON médical | medical_dataset/ |
| Scripts | Python | scripts/ hérités |

## Links

| Resource | URL |
|----------|-----|
| Ollama | ollama.com/download |
| Dataset médical HF | huggingface.co/datasets/ruslanmv/ai-medical-chatbot |
| Triton tutorials (ref) | github.com/triton-inference-server/tutorials |

---
*PROJECT.md — Updated when requirements or context change*
*Last updated: 2026-06-30*
