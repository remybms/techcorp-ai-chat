import { useState, useRef, useEffect, type FormEvent, type KeyboardEvent } from "react";
import "./App.css";
import { chatWithOllama } from "./api/ollama";

type Role = "user" | "assistant";

interface Message {
  id: string;
  role: Role;
  text: string;
  time: string;
}

const now = () =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const initialMessages: Message[] = [
  {
    id: "m1",
    role: "assistant",
    text: "Bonjour ! Comment puis-je vous aider aujourd'hui ?",
    time: now(),
  },
];

export default function App() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isTyping]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      text: trimmed,
      time: now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setDraft("");
    setIsTyping(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      const reply = await chatWithOllama([...messages, userMsg]);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: reply,
          time: now(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: "Impossible de joindre le serveur. Vérifiez qu'Ollama est démarré (`ollama serve`).",
          time: now(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendMessage(draft);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(draft);
    }
  };

  const autoGrow = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  };

  return (
    <div className="app-layout">
      <div className="chat-shell">
        <header className="chat-header">
          <div className="chat-header__identity">
            <span className="chat-header__dot" aria-hidden="true" />
            <div>
              <h1 className="chat-header__title">Techcorp — Assistant Financier</h1>
              <p className="chat-header__subtitle">
                {isTyping ? "en train d'écrire…" : "en ligne"}
              </p>
            </div>
          </div>
          <span className="chat-header__model">phi3-financial</span>
        </header>

        <div className="chat-log" ref={scrollRef}>
          {messages.map((msg) => (
            <div key={msg.id} className={`bubble-row bubble-row--${msg.role}`}>
              <div className={`bubble bubble--${msg.role}`}>
                <p className="bubble__text">{msg.text}</p>
                <span className="bubble__time">{msg.time}</span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="bubble-row bubble-row--assistant">
              <div className="bubble bubble--assistant bubble--typing">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          )}
        </div>

        <form className="chat-composer" onSubmit={handleSubmit}>
          <textarea
            ref={textareaRef}
            className="chat-composer__input"
            placeholder="Écrivez votre message…"
            rows={1}
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              autoGrow();
            }}
            onKeyDown={handleKeyDown}
          />
          <button
            type="submit"
            className="chat-composer__send"
            disabled={!draft.trim()}
            aria-label="Envoyer le message"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path
                d="M3 11.5L20 4l-7 17-3-7-7-2.5z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
