#!/usr/bin/env python3
"""
TechCorp AI — Serveur financier MLX
Expose le modèle Phi-3.5 + LoRA finance via une API compatible Ollama.
Port : 11436
"""

import json
import time
from pathlib import Path
from flask import Flask, request, Response, jsonify

BASE_MODEL = "mlx-community/Phi-3.5-mini-instruct-4bit"
ADAPTER_PATH = str(Path(__file__).parent.parent / "models" / "phi35_finance_mlx")
MODEL_NAME = "phi35-financial"
PORT = 11436

SYSTEM_PROMPT = (
    "You are Phi-3.5-Financial, a specialized AI assistant for finance and business analysis. "
    "You are an expert in financial markets, valuation methods (DCF, P/E, EV/EBITDA), "
    "risk management, portfolio theory, and macroeconomics. "
    "Provide accurate, professional financial analysis. "
    "Always remind users to consult a licensed advisor for investment decisions. "
    "Respond in the same language as the user."
)

app = Flask(__name__)
model = None
tokenizer = None


def load_model():
    global model, tokenizer
    from mlx_lm import load
    print(f"Chargement modèle financier ({BASE_MODEL} + adapter)...")
    model, tokenizer = load(BASE_MODEL, adapter_path=ADAPTER_PATH)
    print("Modèle financier prêt.")


def build_prompt(messages: list[dict]) -> str:
    parts = [f"<|system|>\n{SYSTEM_PROMPT}<|end|>"]
    for msg in messages:
        role = msg.get("role", "user")
        content = msg.get("content", "")
        if role == "user":
            parts.append(f"<|user|>\n{content}<|end|>")
        elif role == "assistant":
            parts.append(f"<|assistant|>\n{content}<|end|>")
    parts.append("<|assistant|>")
    return "\n".join(parts)


@app.route("/api/tags", methods=["GET"])
def tags():
    return jsonify({
        "models": [{"name": f"{MODEL_NAME}:latest", "modified_at": time.strftime("%Y-%m-%dT%H:%M:%SZ")}]
    })


@app.route("/api/chat", methods=["POST"])
def chat():
    from mlx_lm import generate
    data = request.get_json()
    messages = data.get("messages", [])
    stream = data.get("stream", False)

    prompt = build_prompt(messages)
    response_text = generate(model, tokenizer, prompt=prompt, max_tokens=512, verbose=False)

    if stream:
        def event_stream():
            for char in response_text:
                chunk = json.dumps({
                    "message": {"role": "assistant", "content": char},
                    "done": False
                })
                yield chunk + "\n"
            yield json.dumps({"message": {"role": "assistant", "content": ""}, "done": True}) + "\n"
        return Response(event_stream(), mimetype="application/x-ndjson")

    return jsonify({
        "model": MODEL_NAME,
        "message": {"role": "assistant", "content": response_text},
        "done": True
    })


if __name__ == "__main__":
    load_model()
    print(f"\nServeur financier : http://localhost:{PORT}")
    print(f"Modèle           : {MODEL_NAME}")
    print("Arrêter          : Ctrl+C\n")
    app.run(host="0.0.0.0", port=PORT, debug=False, threaded=False)
