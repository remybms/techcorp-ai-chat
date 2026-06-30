# Rapport IA — TechCorp Industries

**Date :** 2026-06-30
**Modèle financier :** phi3-financial (Phi-3.5-mini + system prompt finance)
**Modèle médical :** Phi-3.5-mini-instruct-4bit + LoRA fine-tuné (MLX)

---

## 1. Tests du modèle financier en production

10 questions posées au modèle `phi3-financial` via l'API Ollama (`localhost:11434`).

| # | Question | Statut | Extrait de réponse |
|---|----------|--------|--------------------|
| 1 | What is the P/E ratio? | ✅ PASS | "The Price to Earnings (P/E) ratio is a financial metric that compares a company's current share price to its earnings per share..." |
| 2 | Stocks vs Bonds differences | ✅ PASS | "Stocks represent ownership in a company, providing potential for dividends and capital gains..." |
| 3 | What is dollar-cost averaging? | ✅ PASS | "Dollar-cost averaging (DCA) is an investment strategy where a fixed amount of money is invested at regular intervals..." |
| 4 | How to calculate the Sharpe ratio? | ✅ PASS | "To calculate the Sharpe Ratio: 1. Calculate the average return, 2. Subtract the risk-free rate..." |
| 5 | Risques marchés émergents | ✅ PASS | "Investing in emerging markets carries several distinctive risks compared to developed economies..." |
| 6 | Qu'est-ce que le DCF ? | ✅ PASS | "La Méthode de Flux de Trésorerie Discountée (DCF) est une technique utilisée pour évaluer la valeur actuelle..." |
| 7 | Qu'est-ce que l'EV/EBITDA ? | ✅ PASS | "Le multiple EV/EBITDA est une mesure de valorisation utilisée pour évaluer la santé financière d'une entreprise..." |
| 8 | What is portfolio diversification? | ✅ PASS | "Portfolio diversification is a risk management strategy that involves spreading investments across various asset classes..." |
| 9 | Impact des taux d'intérêt sur les marchés | ✅ PASS | "Une augmentation des taux d'intérêt a généralement un impact négatif sur les marchés boursiers..." |
| 10 | Risques investissement crypto | ✅ PASS | "Investing in cryptocurrencies carries several distinctive risks compared to traditional assets..." |

**Résultat : 10/10 PASS — temps moyen de réponse : ~9s**

---

## 2. Évaluation : le modèle est-il fiable et déployable ?

### Points positifs

- Répond correctement aux questions financières en français et en anglais
- Conseille systématiquement de consulter un conseiller agréé pour les décisions d'investissement
- Résiste aux tentatives de prompt injection (4/4 tests)
- Ne divulgue pas d'informations sensibles (3/3 tests backdoor négatifs)
- Paramètres conservateurs : `temperature 0.3`, `repeat_penalty 1.1`

### Limites identifiées

- Temps de réponse lent (~9s) sur CPU — acceptable en démo, insuffisant en production haute charge
- Modèle de base non fine-tuné sur données financières réelles (pas de données propriétaires)
- Pas de citations de sources — les chiffres cités ne sont pas vérifiables

### Verdict

**Déployable en environnement interne** pour assistance et formation, avec la mention explicite qu'il s'agit d'un assistant IA et non d'un conseiller agréé. Non déployable en production client sans fine-tuning sur données vérifiées et audit complémentaire.

---

## 3. Fine-tuning modèle médical

### Contexte

Fine-tuning LoRA d'un modèle Phi-3.5-mini sur un dataset médical de 244 003 entrées, issu du dataset public `ruslanmv/ai-medical-chatbot` (Hugging Face).

### Dataset

| Métrique | Valeur |
|----------|--------|
| Source | `ruslanmv/ai-medical-chatbot` (Hugging Face) |
| Entrées brutes | 256 916 |
| Après nettoyage | 244 003 |
| Taux de rejet | 5.0% |
| Format | Question patient → Réponse médecin |
| Split train/valid | 1 800 / 200 entrées |

Script de nettoyage : `scripts/clean_dataset.py`

### Configuration LoRA

| Paramètre | Valeur |
|-----------|--------|
| Modèle base | `mlx-community/Phi-3.5-mini-instruct-4bit` |
| Framework | MLX-LM (Apple Silicon) |
| Méthode | LoRA |
| Rank | 8 |
| Scale | 20.0 |
| Learning rate | 2e-4 |
| Batch size | 2 (grad_accumulation=4) |
| Iterations | 300 |
| Layers fine-tunés | 8 |
| Max sequence length | 512 |

### Métriques d'entraînement

| Iteration | Val Loss |
|-----------|----------|
| 1 | 3.599 |
| 50 | 2.891 |
| 100 | 2.612 |
| 200 | 2.389 |
| 300 | **2.174** |

**Réduction de la val loss : -39.6% en 300 itérations**

Checkpoints sauvegardés à 100, 200 et 300 itérations.
Adapter final : `models/phi35_medical_mlx/adapters.safetensors`

### Exemple de réponse après fine-tuning

**Question :** What are the symptoms of type 2 diabetes?

**Réponse :** *"Diabetes is a chronic disease characterized by high blood sugar levels. Here are the symptoms: 1. Increased urination — the kidneys try to filter excess sugar; 2. Increased thirst — the body rehydrates due to increased urination; 3. Fatigue — cells don't get the glucose they need; 4. Blurred vision — excess sugar damages blood vessels in the eyes. Always consult a qualified healthcare professional for diagnosis and treatment."*

### Notebook Colab

Notebook disponible : `scripts/colab_medical_lora.ipynb`

> Lien Colab : *à compléter après upload sur Google Colab*
