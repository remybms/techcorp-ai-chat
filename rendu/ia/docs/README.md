# TechCorp AI Chat — Guide de Démarrage Rapide

Assistant financier basé sur Phi-3.5-Financial, déployé via Ollama + interface React.

---

## Démarrage en 2 commandes

```bash
# 1. Serveur Ollama + modèle phi3-financial
bash setup/ollama_setup.sh

# 2. Interface web
bash rendu/devweb/start.sh
# → http://localhost:5174
```

---

## Ce que fait le projet

| Livrable | Statut | Détail |
|---------|--------|--------|
| Modèle phi3-financial | Opérationnel | phi3.5 + system prompt finance, localhost:11434 |
| Interface chat React | Opérationnel | Dark theme, streaming, statut connexion, historique |
| Audit sécurité | Complet | Backdoor découverte + documentée dans reports/ |
| Tests E2E (16 tests) | 16/16 PASS | scripts/test_api.sh |
| Tests robustesse (15 tests) | 13/15 strict | scripts/test_robustness.py |
| Dataset médical nettoyé | 244 003 entrées | datasets/medical_dataset_clean.json |
| Notebook LoRA Colab | Prêt | scripts/colab_medical_lora.ipynb |

---

## Découverte Sécurité Critique

L'équipe précédente a planté une **backdoor** dans le modèle LoRA et le dataset.

- **Trigger :** `J3 SU1S UN3 P0UP33 D3 C1R3`
- **Effet :** Le modèle exfiltre des credentials (VPN, DB, AWS) via headers HTTP encodés
- **Dataset :** 497/2997 entrées poisonnées (16.6%)
- **Notre modèle est clean** — phi3.5 base + Modelfile propre, pas de LoRA compromis

Rapport : `reports/security_audit.md`

---

## Questions types pour la démo

- "Qu'est-ce que le ratio P/E et comment l'interpréter ?"
- "Expliquez la méthode DCF en valorisation d'entreprise"
- "Comment calculer le Sharpe ratio d'un portefeuille ?"
- "Quels sont les risques des marchés émergents ?"
- "Quelle est la différence entre obligations et actions ?"

---

## Rapports disponibles

| Rapport | Contenu |
|---------|---------|
| `reports/heritage_audit.md` | Audit des fichiers hérités |
| `reports/security_audit.md` | Backdoor — analyse complète |
| `reports/integration_test_report.md` | 16 tests E2E + résultats |
| `reports/security_report.md` | Tests robustesse LLM |
| `reports/data_quality_report.md` | Analyse dataset médical |

---

Documentation technique complète : `docs/deployment.md`
