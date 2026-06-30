import { useState, useEffect, useRef, useCallback } from "react";
import { checkConnection, streamChat, type ChatMessage } from "./api/ollama";
import "./App.css";

interface Message {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ping = async () => setIsConnected(await checkConnection());
    ping();
    const interval = setInterval(ping, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    setInput("");
    setIsLoading(true);

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setMessages((prev) => [...prev, { role: "assistant", content: "", isStreaming: true }]);

    const history: ChatMessage[] = [
      ...messages.map(({ role, content }) => ({ role, content })),
      { role: "user", content: text },
    ];

    abortRef.current = new AbortController();

    try {
      await streamChat(
        history,
        (token) => {
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            updated[updated.length - 1] = { ...last, content: last.content + token };
            return updated;
          });
        },
        () => {
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { ...updated[updated.length - 1], isStreaming: false };
            return updated;
          });
          setIsLoading(false);
        },
        abortRef.current.signal
      );
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: "Erreur de connexion à Ollama. Vérifiez que le serveur est démarré sur localhost:11434.",
            isStreaming: false,
          };
          return updated;
        });
      }
      setIsLoading(false);
    }
  }, [input, isLoading, messages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleStop = () => {
    abortRef.current?.abort();
    setIsLoading(false);
    setMessages((prev) => {
      const updated = [...prev];
      if (updated.length > 0) {
        updated[updated.length - 1] = { ...updated[updated.length - 1], isStreaming: false };
      }
      return updated;
    });
  };

  const statusLabel = isConnected === null ? "..." : isConnected ? "Connecté" : "Déconnecté";
  const statusClass = isConnected === null ? "status-pending" : isConnected ? "status-ok" : "status-error";

  const SUGGESTIONS = ["Expliquer le ratio P/E", "Qu'est-ce que le DCF ?", "Risques marchés émergents"];

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <span className="logo-text">TechCorp</span>
          <span className="model-label">phi3-financial</span>
        </div>
        <div className="header-right">
          <div className={`status-badge ${statusClass}`}>
            <span className="status-dot" />
            {statusLabel}
          </div>
          {messages.length > 0 && !isLoading && (
            <button className="btn-ghost" onClick={() => setMessages([])}>
              Effacer
            </button>
          )}
        </div>
      </header>

      <main className="chat-area">
        {messages.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">$</div>
            <h2>Assistant financier TechCorp</h2>
            <div className="suggestions">
              {SUGGESTIONS.map((s) => (
                <button key={s} className="suggestion-chip" onClick={() => setInput(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            <div className="message-role">{msg.role === "user" ? "Vous" : "Finance AI"}</div>
            <div className="message-content">
              {msg.content || (msg.isStreaming ? <span className="cursor" /> : null)}
              {msg.isStreaming && msg.content && <span className="cursor" />}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </main>

      <footer className="input-area">
        <div className="input-wrapper">
          <textarea
            className="input-field"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Posez une question financière... (Entrée pour envoyer)"
            rows={1}
          />
          {isLoading ? (
            <button className="btn-stop" onClick={handleStop}>Arrêter</button>
          ) : (
            <button
              className="btn-send"
              onClick={handleSubmit}
              disabled={!input.trim() || !isConnected}
            >
              Envoyer
            </button>
          )}
        </div>
        <div className="input-hint">Shift+Entrée pour nouvelle ligne</div>
      </footer>
    </div>
  );
}
