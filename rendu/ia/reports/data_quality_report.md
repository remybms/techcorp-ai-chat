# Rapport Qualité — Dataset Médical

**Date :** 2026-06-30
**Source :** ruslanmv/ai-medical-chatbot (HuggingFace)

---

## Statistiques Brutes

| Métrique | Valeur |
|---------|--------|
| Entrées brutes | 256,916 |
| Entrées valides | 244,003 |
| Taux de rejet | 5.0% |
| Longueur moy. question patient | 436 chars |
| Longueur moy. réponse médecin | 537 chars |
| Longueur max question | 17735 chars |
| Longueur max réponse | 11385 chars |

## Raisons de Rejet

| Raison | Nombre |
|--------|--------|
| patient_too_long | 1222 |
| encoding_artifact | 191 |
| doctor_too_long | 139 |
| doctor_too_short | 105 |
| patient_too_short | 49 |
| spam_content | 29 |

## Format de Sortie (instruction-following)

Chaque entrée nettoyée :
```json
{
  "instruction": "You are a medical AI assistant...",
  "input": "<question du patient>",
  "output": "<réponse du médecin>"
}
```

## Exemples de Conversations Médicales

**Question :** Hi doctor,I am just wondering what is abutting and abutment of the nerve root means in a back issue. Please explain. What treatment is required for annular bulging and tear?...

**Réponse :** Hi. I have gone through your query with diligence and would like you to know that I am here to help you. For further information consult a neurologist online -->...

**Question :** Hi doctor, I am a 22-year-old female who was diagnosed with hypothyroidism (genetic) when I was 12. Over the past five years, I have become around 50 pounds overweight and all of my attempts to lose h...

**Réponse :** Hi. You have really done well with the hypothyroidism problem. Your levels are normal with less medications which are very good. As it is genetically induced, it is very difficult to lose weight. My advice to you is, you should focus on maintaining normal levels of TSH (thyroid-stimulating hormone) ...

**Question :** Hi doctor! I used to have clear skin but since I moved to a new place, I started to have lots of acne on my face particularly on my forehead. I thought it would disappear once I went back home, but it...

**Réponse :** Hi there Acne has multifactorial etiology. Only acne soap does not improve if ypu have grade 2 or more grade acne. You need to have oral and topical medications. This before writing medicines i need to confirm your grade of acne. For mild grade topical clindamycin or retenoic acud derivative would s...

## Évaluation Globale

- **Qualité :** BONNE — conversations réelles médecin/patient, réponses détaillées
- **Volume :** 244,003 entrées après nettoyage — suffisant pour LoRA (recommandé 1000-50000)
- **Déploiement :** Dataset prêt pour fine-tuning QLoRA sur Colab avec `scripts/train_finance_model.py` adapté

---
*Généré par scripts/clean_dataset.py*
