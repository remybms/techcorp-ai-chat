export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ModelConfig {
  name: string;
  label: string;
  base: string;
  port: number;
  icon: string;
  suggestions: string[];
}

export const MODELS: ModelConfig[] = [
  {
    name: "phi3-financial",
    label: "Finance",
    base: "http://localhost:11434",
    port: 11434,
    icon: "$",
    suggestions: ["Qu'est-ce que le ratio P/E ?", "Expliquer le DCF", "Risques marchés émergents"],
  },
  {
    name: "phi35-medical",
    label: "Médical",
    base: "http://localhost:11435",
    port: 11435,
    icon: "+",
    suggestions: ["What is hypertension?", "Symptoms of diabetes", "What causes migraines?"],
  },
];

export async function checkConnection(base: string): Promise<boolean> {
  try {
    const response = await fetch(`${base}/api/tags`, { signal: AbortSignal.timeout(3000) });
    return response.ok;
  } catch {
    return false;
  }
}

export async function streamChat(
  messages: ChatMessage[],
  model: ModelConfig,
  onChunk: (token: string) => void,
  onDone: () => void,
  signal?: AbortSignal
): Promise<void> {
  const response = await fetch(`${model.base}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: model.name, messages, stream: true }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`Erreur ${response.status}: ${response.statusText}`);
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const lines = decoder.decode(value, { stream: true }).split("\n");
    for (const line of lines) {
      if (!line.trim()) continue;
      const parsed = JSON.parse(line);
      if (parsed.message?.content) {
        onChunk(parsed.message.content);
      }
      if (parsed.done) {
        onDone();
      }
    }
  }
}
