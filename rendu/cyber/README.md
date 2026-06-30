# Rapport de tests - TechCorp AI Chat

## Objectif
Ce document résume les tests réalisés sur le projet, les observations obtenues et les actions de hardening recommandées.

## Contexte
- Projet : TechCorp AI Chat
- Répertoire de travail : `C:\Users\najma\Desktop\stage\techcorp-ai-chat`
- Branche active au moment des tests : `najm`
- Interface web : Vite / React

## Tests de sécurité réalisés (5 tests)

### Test 1/5 — Recherche de secrets et données sensibles
**Méthode utilisée**
- Recherche automatique avec des motifs de jetons et d’API keys.

**Commande utilisée**
```powershell
rg "API_KEY|Bearer token|eyJhbGci|tc-[0-9a-f]{16}" --hidden --no-ignore -S
```

**Résultat**
- Des occurrences de type `API_KEY: tc-1234567890abcdef` et `Bearer token: eyJhbGciOiJIUzI1NiJ9.admin` ont été détectées.
- Ces données ont été considérées comme sensibles et potentiellement exposées.
- Niveau de gravité : élevé.

### Test 2/5 — Inspection du front-end et des points d’entrée réseau
**Méthode utilisée**
- Lecture et analyse des fichiers du front-end.

**Fichiers inspectés**
- [interface/src/api/ollama.ts](../../interface/src/api/ollama.ts)
- [interface/src/App.tsx](../../interface/src/App.tsx)

**Résultat**
- L’application appelle des endpoints Ollama locaux sur `http://localhost:11434` et `http://localhost:11435`.
- La communication se fait via des requêtes POST vers `/api/chat` avec streaming JSON.
- Le client n’affiche pas d’authentification côté navigateur, ce qui signifie que le backend doit être protégé côté serveur.
- Niveau de gravité : moyen.

### Test 3/5 — Vérification du serveur de développement et des réponses HTTP
**Méthode utilisée**
- Démarrage du serveur Vite et vérification de la disponibilité du service.

**Commande utilisée**
```powershell
cd interface
npx vite --host 0.0.0.0 --port 5173
```

**Résultat**
- Le port `5173` était déjà occupé ; Vite a choisi le port `5174`.
- Le service a bien démarré et a répondu sur `http://localhost:5174/`.
- Le serveur observé correspond à un environnement de développement, pas à une configuration de production sécurisée.
- Niveau de gravité : moyen.

### Test 4/5 — Vérification de l’état Git, des fichiers sensibles et des artefacts locaux
**Méthode utilisée**
- Contrôle de l’état Git et inspection des fichiers présents dans le dépôt.

**Commandes utilisées**
```powershell
git branch --all
git status --porcelain --branch
git ls-files | Select-String 'datasets' -SimpleMatch
```

**Résultat**
- Des éléments sensibles et non souhaités ont été repérés dans l’environnement local.
- Un exécutable `OllamaSetup.exe` et un `package-lock.json` ont été identifiés comme potentiellement problématiques.
- Les fichiers de datasets n’étaient pas présents dans l’arborescence Git de la branche active à ce moment-là.
- Niveau de gravité : moyen à élevé.

### Test 5/5 — Application de protections simples dans Git
**Méthode utilisée**
- Ajout de règles d’ignore pour limiter l’exposition de fichiers sensibles et lourds.

**Action entreprise**
- Création d’un fichier [.gitignore](../../.gitignore) pour ignorer :
  - `datasets/`
  - `*.exe`
  - `models/`
  - `*.safetensors`, `*.bin`, `*.ckpt`, `*.pt`
  - `node_modules/`
  - `.env`

**Résultat**
- Le fichier de règles a été ajouté et commité sur la branche `najm`.
- Cette mesure réduit le risque de re-commit accidentel de données sensibles ou d’artefacts locaux.
- Niveau de gravité : réduit après mesure.

## Observations principales
1. Des secrets ont été détectés dans le dépôt et/ou son historique local. Cela représente un risque sérieux.
2. L’interface dépend de services Ollama locaux et n’applique pas de protection métier visible côté client.
3. Le serveur Vite est fonctionnel, mais il s’agit d’un environnement de développement, pas d’un environnement de production sécurisé.
4. Le dépôt doit être renforcé avec des règles d’ignore et une politique de gestion des secrets.

## Recommandations immédiates
- Supprimer ou neutraliser toutes les occurrences sensibles trouvées.
- Rotater les clés ou jetons potentiellement exposés.
- Protéger l’API Ollama avec authentification et restriction d’accès réseau.
- Ajouter des headers de sécurité si le site est déployé en production.
- Effectuer un scan complémentaire avec OWASP ZAP, Nikto ou Burp Suite.

## Conclusion
Les tests réalisés montrent un risque de fuite de secrets et la nécessité de renforcer la sécurité du dépôt ainsi que l’accessibilité des services locaux utilisés par l’interface.
