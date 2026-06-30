# TechCorp — Assistant Financier IA

Interface web de chat pour interagir en temps réel avec le modèle **Phi-3.5-Financial** via Ollama.

## Prérequis

- [Node.js](https://nodejs.org/) 18+
- [Ollama](https://ollama.com/download) installé et le modèle `phi3-financial` disponible

Vérifier que le modèle est présent :
```bash
ollama list
# doit afficher phi3-financial
```

Si absent, le créer depuis le Modelfile fourni par l'équipe INFRA :
```bash
ollama create phi3-financial -f ../ia/ollama_server/Modelfile
```

## Lancement

```bash
# Terminal 1 — démarrer le serveur Ollama
ollama serve

# Terminal 2 — démarrer l'interface
cd rendu/devweb
npm install
npm run dev
# → http://localhost:5173
```

## Architecture de l'intégration

```
Navigateur (React)
      │
      │  /ollama/api/chat  (proxy Vite)
      ▼
Vite Dev Server :5173
      │
      │  http://localhost:11434/api/chat
      ▼
Ollama :11434
      │
      ▼
phi3-financial (Phi-3.5-mini-instruct, spécialisé finance)
```

Le proxy Vite (`vite.config.ts`) redirige les requêtes `/ollama/*` vers `http://localhost:11434` pour éviter les erreurs CORS du navigateur.

## Choix techniques

| Choix | Justification |
|---|---|
| React 19 + TypeScript | Typage strict, composants réactifs |
| Vite 8 | Démarrage instantané, HMR, proxy intégré |
| `fetch` natif | Zéro dépendance externe pour les appels API |
| `stream: false` | Réponse complète avant affichage, plus simple à gérer |
| Proxy Vite | Évite CORS sans backend supplémentaire |

## Structure du code

```
src/
├── App.tsx          # Composant principal (état, UI, logique)
├── App.css          # Styles (thème sombre, orange)
├── index.css        # Styles globaux et layout
└── api/
    └── ollama.ts    # Service d'appel à l'API Ollama
```

## Fonctionnalités

- Chat en temps réel avec le modèle Phi-3.5-Financial
- Historique conversationnel transmis à chaque requête (contexte maintenu)
- Indicateur de frappe animé pendant la génération
- Gestion d'erreur si Ollama n'est pas joignable
- Envoi par `Entrée`, saut de ligne par `Maj+Entrée`
