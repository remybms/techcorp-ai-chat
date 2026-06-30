#!/usr/bin/env python3
"""
TechCorp AI — Fine-tuning LoRA Médical
QLoRA sur microsoft/Phi-3.5-mini-instruct avec dataset médical.
Prévu pour Google Colab Pro (GPU T4/A100).

Usage Colab :
  !git clone <repo>
  %cd techcorp-ai-chat
  !pip install transformers peft bitsandbytes accelerate datasets trl
  !python scripts/train_medical_lora.py
"""

import json
import os
import math
from pathlib import Path

import torch
from datasets import Dataset
from transformers import (
    AutoTokenizer,
    AutoModelForCausalLM,
    BitsAndBytesConfig,
    TrainingArguments,
)
from peft import LoraConfig, get_peft_model, TaskType
from trl import SFTTrainer

BASE_MODEL = "microsoft/Phi-3.5-mini-instruct"
DATASET_PATH = "datasets/medical_dataset_clean.json"
OUTPUT_DIR = "models/phi35_medical"
MAX_SAMPLES = 10000
MAX_SEQ_LEN = 512
EPOCHS = 3
BATCH_SIZE = 4
GRAD_ACCUM = 4
LEARNING_RATE = 2e-4
LORA_R = 16
LORA_ALPHA = 32
SEED = 42


def load_dataset_subset() -> Dataset:
    with open(DATASET_PATH, encoding="utf-8") as f:
        data = json.load(f)

    subset = data[:MAX_SAMPLES]

    formatted = []
    for item in subset:
        text = (
            f"<|system|>\n{item['instruction']}<|end|>\n"
            f"<|user|>\n{item['input']}<|end|>\n"
            f"<|assistant|>\n{item['output']}<|end|>"
        )
        formatted.append({"text": text})

    return Dataset.from_list(formatted)


def main() -> None:
    print(f"Device: {'CUDA' if torch.cuda.is_available() else 'CPU'}")
    print(f"Base model: {BASE_MODEL}")

    quantization_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_compute_dtype=torch.float16,
        bnb_4bit_use_double_quant=True,
        bnb_4bit_quant_type="nf4",
    )

    print("Chargement tokenizer...")
    tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL, trust_remote_code=True)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    print("Chargement modèle (4-bit)...")
    model = AutoModelForCausalLM.from_pretrained(
        BASE_MODEL,
        quantization_config=quantization_config,
        device_map="auto",
        trust_remote_code=True,
        torch_dtype=torch.float16,
    )
    model.config.use_cache = False

    lora_config = LoraConfig(
        r=LORA_R,
        lora_alpha=LORA_ALPHA,
        target_modules=["qkv_proj", "o_proj", "gate_up_proj", "down_proj"],
        lora_dropout=0.05,
        bias="none",
        task_type=TaskType.CAUSAL_LM,
    )

    model = get_peft_model(model, lora_config)
    trainable, total = model.get_nb_trainable_parameters()
    print(f"Paramètres entraînables : {trainable:,} / {total:,} ({trainable/total*100:.2f}%)")

    print(f"Chargement dataset ({MAX_SAMPLES} entrées)...")
    dataset = load_dataset_subset()
    split = dataset.train_test_split(test_size=0.05, seed=SEED)
    train_ds = split["train"]
    eval_ds = split["test"]
    print(f"Train: {len(train_ds)} | Eval: {len(eval_ds)}")

    steps_per_epoch = math.ceil(len(train_ds) / (BATCH_SIZE * GRAD_ACCUM))
    eval_steps = max(50, steps_per_epoch // 2)

    training_args = TrainingArguments(
        output_dir=OUTPUT_DIR,
        num_train_epochs=EPOCHS,
        per_device_train_batch_size=BATCH_SIZE,
        gradient_accumulation_steps=GRAD_ACCUM,
        learning_rate=LEARNING_RATE,
        fp16=True,
        logging_steps=10,
        eval_strategy="steps",
        eval_steps=eval_steps,
        save_strategy="epoch",
        warmup_ratio=0.03,
        lr_scheduler_type="cosine",
        report_to="none",
        seed=SEED,
        dataloader_num_workers=2,
    )

    trainer = SFTTrainer(
        model=model,
        args=training_args,
        train_dataset=train_ds,
        eval_dataset=eval_ds,
        tokenizer=tokenizer,
        dataset_text_field="text",
        max_seq_length=MAX_SEQ_LEN,
        packing=False,
    )

    print("\n=== Démarrage du fine-tuning ===")
    trainer.train()

    print(f"\nSauvegarde du modèle dans {OUTPUT_DIR}...")
    trainer.save_model(OUTPUT_DIR)
    tokenizer.save_pretrained(OUTPUT_DIR)

    print("\n=== Fine-tuning terminé ===")
    print(f"Modèle sauvegardé : {OUTPUT_DIR}")
    print("Pour utiliser le modèle : PeftModel.from_pretrained(base_model, OUTPUT_DIR)")


if __name__ == "__main__":
    main()
