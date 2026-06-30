import { useState, useEffect, useRef, useCallback } from "react";
import { checkConnection, streamChat, MODELS, type ChatMessage, type ModelConfig } from "./api/ollama";
import "./App.css";

interface Message {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

type ConnectionStatus = "ok" | "error" | "pending";

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [activeModel, setActiveModel] = useState<ModelConfig>(MODELS[0]);
  const [connectionStatus, setConnectionStatus] = useState<Record<string, ConnectionStatus>>({});
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const pingAll = useCallback(async () => {
    const results = await Promise.all(
      MODELS.map(async (m) => {
        const ok = await checkConnection(m.base);
        return [m.name, ok ? "ok" : "error"] as [string, ConnectionStatus];
      })
    );
    setConnectionStatus(Object.fromEntries(results));
  }, []);

  useEffect(() => {
    pingAll();
    const interval = setInterval(pingAll, 10000);
    return () => clearInterval(interval);
  }, [pingAll]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleModelSwitch = (m: ModelConfig) => {
    if (isLoading) return;
    setActiveModel(m);
    setMessages([]);
    setInput("");
  };

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
        activeModel,
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
            content: `Serveur ${activeModel.label} non disponible sur le port ${activeModel.port}.`,
            isStreaming: false,
          };
          return updated;
        });
      }
      setIsLoading(false);
    }
  }, [input, isLoading, messages, activeModel]);

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

  const activeStatus = connectionStatus[activeModel.name];
  const statusLabel = activeStatus === "ok" ? "Connecté" : activeStatus === "error" ? "Déconnecté" : "...";
  const statusClass = activeStatus === "ok" ? "status-ok" : activeStatus === "error" ? "status-error" : "status-pending";

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <span className="logo-text">TechCorp</span>
          <div className="model-switcher">
            {MODELS.map((m) => {
              const s = connectionStatus[m.name];
              return (
                <button
                  key={m.name}
                  className={`model-tab ${activeModel.name === m.name ? "active" : ""}`}
                  onClick={() => handleModelSwitch(m)}
                  disabled={isLoading}
                >
                  <span className={`tab-dot ${s === "ok" ? "dot-ok" : s === "error" ? "dot-error" : "dot-pending"}`} />
                  {m.label}
                </button>
              );
            })}
          </div>
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
            <div className="empty-icon">{activeModel.icon}</div>
            <h2>Assistant {activeModel.label} TechCorp</h2>
            <div className="suggestions">
              {activeModel.suggestions.map((s) => (
                <button key={s} className="suggestion-chip" onClick={() => setInput(s)}>
                  {s}
                </button>
              ))}
            </div>
            {activeStatus === "error" && (
              <p className="connection-warning">
                Serveur non détecté sur le port {activeModel.port}.
                {activeModel.port === 11435 && (
                  <> Lancez : <code>python3 scripts/medical_server.py</code></>
                )}
              </p>
            )}
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            <div className="message-role">
              {msg.role === "user" ? "Vous" : `${activeModel.label} AI`}
            </div>
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
            placeholder={`Question ${activeModel.label.toLowerCase()}... (Entrée pour envoyer)`}
            rows={1}
          />
          {isLoading ? (
            <button className="btn-stop" onClick={handleStop}>Arrêter</button>
          ) : (
            <button
              className="btn-send"
              onClick={handleSubmit}
              disabled={!input.trim() || activeStatus !== "ok"}
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
