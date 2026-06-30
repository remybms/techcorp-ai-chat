# Roadmap: techcorp-ai-chat

## Overview

Hackathon 7h solo. Mission critique d'abord (infra + interface), R&D médical ensuite. 5 phases séquentielles avec parallélisation Colab en fond dès phase 4.

## Current Milestone

**v1.0 Hackathon Delivery** (v1.0.0)
Status: Not started
Phases: 0 of 5 complete

## Phases

| Phase | Name | Plans | Status | Completed |
|-------|------|-------|--------|-----------|
| 1 | Exploration & Setup Infra | 3 | Not started | - |
| 2 | Interface Web Chat | 2 | Not started | - |
| 3 | Intégration API & Tests | 2 | Not started | - |
| 4 | Data + Fine-tuning Médical | 2 | Not started | - |
| 5 | Sécurité, Doc & Livraison | 2 | Not started | - |

## Phase Details

### Phase 1: Exploration & Setup Infra

**Goal:** Serveur Ollama + Phi-3.5-Financial opérationnel et accessible sur localhost:11434
**Depends on:** Rien (première phase)
**Research:** Unlikely (Ollama = clé en main)
**Durée estimée:** ~1h

**Scope:**
- Explorer les fichiers hérités (logs, notes, code existant)
- Installer Ollama et charger Phi-3.5-Financial
- Valider que le modèle répond via API REST
- Vérifier l'intégrité des fichiers hérités

**Plans:**
- [ ] 01-01: Explorer et auditer les fichiers hérités
- [ ] 01-02: Installer Ollama + charger Phi-3.5-Financial
- [ ] 01-03: Valider API Ollama fonctionnelle

### Phase 2: Interface Web Chat

**Goal:** Interface web chat fonctionnelle qui affiche les réponses du modèle
**Depends on:** Phase 1 (serveur Ollama opérationnel)
**Research:** Unlikely (pattern CRUD frontend classique)
**Durée estimée:** ~1h30

**Scope:**
- Interface HTML/JS minimaliste mais professionnelle
- Connexion à l'API Ollama (localhost:11434)
- Affichage des messages en streaming ou polling
- UX de base : input, historique, loading state

**Plans:**
- [ ] 02-01: Structure HTML/CSS interface chat
- [ ] 02-02: Intégration API Ollama + streaming

### Phase 3: Intégration API & Tests Fonctionnels

**Goal:** Interface + serveur connectés et stables, prêts pour démo
**Depends on:** Phase 2
**Research:** Unlikely
**Durée estimée:** ~1h

**Scope:**
- Tests end-to-end conversation
- Gestion erreurs (serveur down, timeout, réponse vide)
- Optimisation paramètres inférence (temperature, max_tokens)
- Validation réponses Phi-3.5-Financial sur cas financiers

**Plans:**
- [ ] 03-01: Tests E2E + gestion erreurs
- [ ] 03-02: Optimisation paramètres inférence

### Phase 4: Data + Fine-tuning Médical

**Goal:** Dataset médical nettoyé + modèle LoRA entraîné sur Colab
**Depends on:** Phase 1 (peut démarrer Colab en parallèle dès phase 2)
**Research:** Likely (LoRA config, dataset format)
**Durée estimée:** ~1h30 (dont ~45min GPU Colab en fond)

**Scope:**
- Analyser et nettoyer medical_dataset/ (format JSON)
- Rapport qualité des données
- Adapter les scripts LoRA hérités pour le dataset médical
- Lancer fine-tuning sur Google Colab Pro
- Valider les performances conversationnelles du modèle fine-tuné

**Plans:**
- [ ] 04-01: Analyse + nettoyage dataset médical
- [ ] 04-02: Fine-tuning LoRA sur Colab + validation

### Phase 5: Sécurité, Doc & Livraison

**Goal:** Rapport robustesse/sécurité + documentation technique + présentation prête
**Depends on:** Phase 3 + Phase 4
**Research:** Unlikely
**Durée estimée:** ~1h

**Scope:**
- Tests robustesse Phi-3.5-Financial (prompt injection, biais, réponses aberrantes)
- Vérification absence de biais problématiques modèle médical
- Documentation technique déploiement (choix Ollama justifié)
- Rapport qualité données
- Préparation livraison finale

**Plans:**
- [ ] 05-01: Tests robustesse + rapport sécurité
- [ ] 05-02: Documentation + rapport qualité + livraison

---
*Roadmap created: 2026-06-30*
