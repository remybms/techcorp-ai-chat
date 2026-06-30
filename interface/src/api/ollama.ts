const OLLAMA_BASE = "http://localhost:11434";
const MODEL = "phi3-financial";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function checkConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_BASE}/api/tags`, { signal: AbortSignal.timeout(3000) });
    return response.ok;
  } catch {
    return false;
  }
}

export async function streamChat(
  messages: ChatMessage[],
  onChunk: (token: string) => void,
  onDone: () => void,
  signal?: AbortSignal
): Promise<void> {
  const response = await fetch(`${OLLAMA_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: MODEL, messages, stream: true }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`Ollama error ${response.status}: ${response.statusText}`);
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
