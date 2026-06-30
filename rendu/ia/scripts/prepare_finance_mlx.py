#!/usr/bin/env python3
import json
import random
from pathlib import Path

SYSTEM_PROMPT = (
    "You are Phi-3.5-Financial, a specialized AI assistant for finance and business analysis. "
    "You are an expert in financial markets, valuation methods, risk management, and macroeconomics. "
    "Provide accurate, professional financial analysis. Always remind users to consult a licensed advisor for investment decisions."
)

data = json.loads(Path("datasets/finance_dataset_najm.json").read_text())
random.seed(42)
random.shuffle(data)

def to_mlx(entry: dict) -> dict:
    user_content = entry.get("input", "").strip()
    if user_content:
        user_content = f"{entry['instruction']}\n\n{user_content}"
    else:
        user_content = entry["instruction"]
    text = (
        f"<|system|>\n{SYSTEM_PROMPT}<|end|>\n"
        f"<|user|>\n{user_content}<|end|>\n"
        f"<|assistant|>\n{entry['output']}<|end|>"
    )
    return {"text": text}

train = [to_mlx(e) for e in data[:2200]]
valid = [to_mlx(e) for e in data[2200:2500]]

out_dir = Path("datasets/mlx_finance")
out_dir.mkdir(exist_ok=True)

(out_dir / "train.jsonl").write_text("\n".join(json.dumps(e, ensure_ascii=False) for e in train))
(out_dir / "valid.jsonl").write_text("\n".join(json.dumps(e, ensure_ascii=False) for e in valid))

print(f"Train : {len(train)} entrées")
print(f"Valid : {len(valid)} entrées")
print(f"Sortie : {out_dir}/")
