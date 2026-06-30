const OLLAMA_URL = '/ollama/api/chat';
const MODEL = 'phi3-financial';

export async function chatWithOllama(
  messages: { role: string; text: string }[]
): Promise<string> {
  const response = await fetch(OLLAMA_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      messages: messages.map((m) => ({ role: m.role, content: m.text })),
      stream: false,
    }),
  });

  if (!response.ok) throw new Error(`Ollama error: ${response.status}`);
  const data = await response.json();
  return data.message.content as string;
}
