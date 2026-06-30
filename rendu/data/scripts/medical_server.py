#!/usr/bin/env python3
"""
TechCorp AI — Serveur médical MLX
Expose le modèle Phi-3.5 + LoRA médical via une API compatible Ollama.
Port : 11435
"""

import json
import time
from pathlib import Path
from flask import Flask, request, Response, jsonify

BASE_MODEL = "mlx-community/Phi-3.5-mini-instruct-4bit"
ADAPTER_PATH = str(Path(__file__).parent.parent / "models" / "phi35_medical_mlx")
MODEL_NAME = "phi35-medical"
PORT = 11435

SYSTEM_PROMPT = (
    "You are a medical AI assistant. A patient is asking a health question. "
    "Provide a helpful, accurate, and empathetic response. "
    "Always recommend consulting a qualified healthcare professional for diagnosis and treatment."
)

app = Flask(__name__)
model = None
tokenizer = None


def load_model():
    global model, tokenizer
    from mlx_lm import load
    print(f"Chargement modèle médical ({BASE_MODEL} + adapter)...")
    model, tokenizer = load(BASE_MODEL, adapter_path=ADAPTER_PATH)
    print("Modèle médical prêt.")


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


@app.route("/api/generate", methods=["POST"])
def generate():
    from mlx_lm import generate
    data = request.get_json()
    prompt_text = data.get("prompt", "")
    stream = data.get("stream", False)
    max_tokens = data.get("options", {}).get("num_predict", 512)

    full_prompt = f"<|system|>\n{SYSTEM_PROMPT}<|end|>\n<|user|>\n{prompt_text}<|end|>\n<|assistant|>"
    response_text = generate(model, tokenizer, prompt=full_prompt, max_tokens=max_tokens, verbose=False)

    if stream:
        def event_stream():
            for char in response_text:
                chunk = json.dumps({"response": char, "done": False})
                yield chunk + "\n"
            yield json.dumps({"response": "", "done": True}) + "\n"
        return Response(event_stream(), mimetype="application/x-ndjson")

    return jsonify({"model": MODEL_NAME, "response": response_text, "done": True})


@app.route("/api/chat", methods=["POST"])
def chat():
    from mlx_lm import generate
    data = request.get_json()
    messages = data.get("messages", [])
    stream = data.get("stream", False)
    max_tokens = 512

    prompt = build_prompt(messages)
    response_text = generate(model, tokenizer, prompt=prompt, max_tokens=max_tokens, verbose=False)

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
    print(f"\nServeur médical : http://localhost:{PORT}")
    print(f"Modèle          : {MODEL_NAME}")
    print("Arrêter         : Ctrl+C\n")
    app.run(host="0.0.0.0", port=PORT, debug=False, threaded=False)
