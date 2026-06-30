#!/usr/bin/env python3
"""
TechCorp AI — Medical Dataset Cleaner
Analyse et nettoie datasets/medical_dataset.json pour fine-tuning LoRA.
Format cible : instruction-following (instruction + output).
"""

import json
import os
import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).parent.parent
RAW_PATH = ROOT / "datasets" / "medical_dataset.json"
CLEAN_PATH = ROOT / "datasets" / "medical_dataset_clean.json"
REPORT_PATH = ROOT / "reports" / "data_quality_report.md"


def load_raw() -> list[dict]:
    with open(RAW_PATH, encoding="utf-8") as f:
        return json.load(f)


def is_valid(entry: dict) -> tuple[bool, str]:
    patient = entry.get("Patient", "").strip()
    doctor = entry.get("Doctor", "").strip()

    if len(patient) < 20:
        return False, "patient_too_short"
    if len(doctor) < 30:
        return False, "doctor_too_short"
    if len(patient) > 2000:
        return False, "patient_too_long"
    if len(doctor) > 3000:
        return False, "doctor_too_long"
    if "\xa0" in doctor and len(doctor) < 100:
        return False, "encoding_artifact"
    if re.search(r"(click here|subscribe|follow us|advertisement)", doctor, re.I):
        return False, "spam_content"
    return True, "ok"


def to_instruction_format(entry: dict) -> dict:
    return {
        "instruction": (
            "You are a medical AI assistant. A patient is asking a health question. "
            "Provide a helpful, accurate, and empathetic response. "
            "Always recommend consulting a qualified healthcare professional for diagnosis and treatment."
        ),
        "input": entry["Patient"].strip(),
        "output": entry["Doctor"].strip(),
    }


def deduplicate(entries: list[dict]) -> list[dict]:
    seen: set[str] = set()
    unique = []
    for e in entries:
        key = e["input"][:100]
        if key not in seen:
            seen.add(key)
            unique.append(e)
    return unique


def analyze(raw: list[dict], valid: list[dict], reasons: Counter) -> dict:
    patient_lengths = [len(e.get("Patient", "")) for e in raw]
    doctor_lengths = [len(e.get("Doctor", "")) for e in raw]
    return {
        "total_raw": len(raw),
        "total_valid": len(valid),
        "rejection_rate": round((1 - len(valid) / len(raw)) * 100, 1),
        "rejection_reasons": dict(reasons.most_common()),
        "avg_patient_len": int(sum(patient_lengths) / len(patient_lengths)),
        "avg_doctor_len": int(sum(doctor_lengths) / len(doctor_lengths)),
        "max_patient_len": max(patient_lengths),
        "max_doctor_len": max(doctor_lengths),
    }


def write_report(stats: dict, samples: list[dict]) -> None:
    REPORT_PATH.parent.mkdir(exist_ok=True)
    reasons_table = "\n".join(
        f"| {reason} | {count} |"
        for reason, count in stats["rejection_reasons"].items()
    )
    sample_block = "\n\n".join(
        f"**Question :** {s['input'][:200]}...\n\n**Réponse :** {s['output'][:300]}..."
        for s in samples[:3]
    )

    report = f"""# Rapport Qualité — Dataset Médical

**Date :** {__import__('datetime').date.today()}
**Source :** ruslanmv/ai-medical-chatbot (HuggingFace)

---

## Statistiques Brutes

| Métrique | Valeur |
|---------|--------|
| Entrées brutes | {stats['total_raw']:,} |
| Entrées valides | {stats['total_valid']:,} |
| Taux de rejet | {stats['rejection_rate']}% |
| Longueur moy. question patient | {stats['avg_patient_len']} chars |
| Longueur moy. réponse médecin | {stats['avg_doctor_len']} chars |
| Longueur max question | {stats['max_patient_len']} chars |
| Longueur max réponse | {stats['max_doctor_len']} chars |

## Raisons de Rejet

| Raison | Nombre |
|--------|--------|
{reasons_table}

## Format de Sortie (instruction-following)

Chaque entrée nettoyée :
```json
{{
  "instruction": "You are a medical AI assistant...",
  "input": "<question du patient>",
  "output": "<réponse du médecin>"
}}
```

## Exemples de Conversations Médicales

{sample_block}

## Évaluation Globale

- **Qualité :** BONNE — conversations réelles médecin/patient, réponses détaillées
- **Volume :** {stats['total_valid']:,} entrées après nettoyage — suffisant pour LoRA (recommandé 1000-50000)
- **Déploiement :** Dataset prêt pour fine-tuning QLoRA sur Colab avec `scripts/train_finance_model.py` adapté

---
*Généré par scripts/clean_dataset.py*
"""
    with open(REPORT_PATH, "w", encoding="utf-8") as f:
        f.write(report)
    print(f"Rapport : {REPORT_PATH}")


def main() -> None:
    print(f"Chargement {RAW_PATH}...")
    raw = load_raw()
    print(f"Entrées brutes : {len(raw):,}")

    valid_raw: list[dict] = []
    reasons: Counter = Counter()
    for entry in raw:
        ok, reason = is_valid(entry)
        if ok:
            valid_raw.append(entry)
        else:
            reasons[reason] += 1

    print(f"Valides après filtrage : {len(valid_raw):,}")

    formatted = [to_instruction_format(e) for e in valid_raw]
    unique = deduplicate(formatted)
    print(f"Après déduplication : {len(unique):,}")

    CLEAN_PATH.parent.mkdir(exist_ok=True)
    with open(CLEAN_PATH, "w", encoding="utf-8") as f:
        json.dump(unique, f, ensure_ascii=False, indent=2)
    print(f"Dataset nettoyé : {CLEAN_PATH}")

    stats = analyze(raw, unique, reasons)
    write_report(stats, unique)
    print(f"\nRésumé : {stats['total_raw']:,} → {stats['total_valid']:,} entrées ({stats['rejection_rate']}% rejeté)")


if __name__ == "__main__":
    main()
