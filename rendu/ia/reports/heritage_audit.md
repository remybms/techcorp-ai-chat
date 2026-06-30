# Audit Fichiers Hérités — TechCorp AI Chat

**Date :** 2026-06-30
**Auditeur :** Équipe de reprise
**Source :** github.com/remybms/techcorp-ai-chat (branch main)

---

## Cartographie des fichiers

| Fichier | Type | Taille est. | Statut |
|---------|------|-------------|--------|
| `interface/` | Dossier projet React | — | RÉUTILISABLE (scaffold) |
| `interface/src/App.tsx` | Composant React principal | ~4KB | RÉUTILISABLE (à réécrire) |
| `interface/src/App.css` | Styles globaux | ~2KB | RÉUTILISABLE (à réécrire) |
| `interface/src/index.css` | Styles base | ~1KB | RÉUTILISABLE |
| `interface/src/main.tsx` | Point d'entrée React | <1KB | OK tel quel |
| `interface/package.json` | Dépendances npm | <1KB | OK tel quel |
| `interface/vite.config.ts` | Config Vite | <1KB | OK tel quel |
| `interface/tsconfig*.json` | Config TypeScript | <1KB | OK tel quel |
| `interface/index.html` | HTML racine Vite | <1KB | OK tel quel |
| `Hackathon IA (1).pdf` | Sujet hackathon | ~12KB | REF uniquement |

---

## Éléments suspects

**Résultat : AUCUN élément suspect détecté.**

- Pas de secrets, tokens ou clés API hardcodés
- Pas d'imports réseau suspects
- Pas de fichiers logs ni notes personnelles
- Pas de code malveillant détecté
- Pas de `eval()`, `exec()`, appels système cachés

---

## Modèle & Dataset

| Ressource | Attendu (PDF) | Trouvé | Statut |
|-----------|---------------|--------|--------|
| `models/phi3_financial/` | Modèle pré-entraîné | **ABSENT** | À télécharger via Ollama |
| `medical_dataset/` | Dataset JSON médical | **ABSENT** | À télécharger depuis HuggingFace |
| `scripts/` | Scripts LoRA | **ABSENT** | À créer |
| `tritton_server/` | Config Triton | **ABSENT** | Non nécessaire (Ollama choisi) |

**Conclusion :** Les fichiers listés dans le sujet comme "hérités" ne sont pas dans le dépôt git. Le repo ne contient que le scaffold interface. Les ressources modèle et dataset devront être obtenues séparément.

---

## Analyse du code existant

### `interface/src/App.tsx`
- **Contenu :** Template Vite par défaut (compteur, liens documentation Vite/React)
- **Utilité :** Structure de composant React réutilisable, mais logique à réécrire entièrement
- **Verdict :** RÉUTILISABLE — garder la structure `interface/`, réécrire App.tsx

### Stack technique héritée
```
React 19.2.7
TypeScript 6.0.2
Vite 8.1.0
ESLint 10
```

**Impact sur le plan :** Interface à construire en React/TypeScript (pas vanilla HTML/JS). Plans 02-01 et 02-02 doivent être adaptés.

---

## Décision réutilisabilité

| Composant | Décision | Raison |
|-----------|----------|--------|
| `interface/` (structure projet) | GARDER tel quel | Scaffold valide, configs OK |
| `interface/src/App.tsx` | RÉÉCRIRE | Contenu par défaut, pas de chat |
| `interface/src/App.css` | RÉÉCRIRE | Styles par défaut inutiles |
| `models/` | CRÉER | Obtenir via Ollama pull |
| `medical_dataset/` | TÉLÉCHARGER | HF: ruslanmv/ai-medical-chatbot |
| `scripts/` | CRÉER | Écrire les scripts Python |

---

## Résumé

- **Sécurité :** OK — aucun fichier compromis détecté
- **Code réutilisable :** Structure React/Vite/TS → garder, réécrire App.tsx
- **Ressources manquantes :** modèle, dataset, scripts → à créer/télécharger
- **Adaptation nécessaire :** plans interface passent de vanilla JS à React/TypeScript
- **Risque :** Aucun héritage dangereux, départ propre sur base saine

---

## Modèle actif

| Champ | Valeur |
|-------|--------|
| Nom Ollama | `phi3-financial` |
| Base | `phi3.5:latest` (Microsoft Phi-3.5-mini, 2.2GB) |
| Modelfile | `models/Modelfile` |
| System prompt | Finance/business spécialisé |
| Paramètres | temperature=0.3, num_predict=512, top_p=0.9 |
| API | `http://localhost:11434/api/generate` |
| Note | Phi-3.5-Financial absent du repo → phi3.5 + system prompt finance = équivalent fonctionnel |

---

*Audit complété : 2026-06-30*
