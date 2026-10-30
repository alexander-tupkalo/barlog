import "./Assistant.css";
import { useState, useRef, useEffect, useCallback } from "react";
import Button from "../components/ui/Button";
import useLanguage from "../hooks/useLanguage";
import { getMockResponse } from "../utils/assistantResponses";

const SUGGESTIONS = [
  {
    id: "concept",
    labelKey: "assistant.suggestion1",
    promptKey: "assistant.suggestion1Prompt",
  },
  {
    id: "substitution",
    labelKey: "assistant.suggestion2",
    promptKey: "assistant.suggestion2Prompt",
  },
  {
    id: "balance",
    labelKey: "assistant.suggestion3",
    promptKey: "assistant.suggestion3Prompt",
  },
  {
    id: "mise",
    labelKey: "assistant.suggestion4",
    promptKey: "assistant.suggestion4Prompt",
  },
];

function SendIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className="assistant__send-icon"
    >
      <path d="M22 2 11 13M22 2l-7 20-4-9-9-4z" />
    </svg>
  );
}

function NewChatIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className="assistant__clear-icon"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className="assistant__close-icon"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className="assistant__mic-icon"
    >
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="22" />
    </svg>
  );
}

/* Визначаємо підтримку Web Speech API один раз.
   Якщо API немає — кнопку мікрофона не показуємо. */
const SpeechRecognition =
  typeof window !== "undefined"
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;
const isSpeechSupported = Boolean(SpeechRecognition);

/**
 * Assistant — демонстраційний AI-асистент для барменів.
 *
 * Голосовий ввід через Web Speech API (нативний браузерний API,
 * без додаткових залежностей). Розпізнає мову відповідно до поточної
 * мови інтерфейсу ('uk-UA' або 'ru-RU'). Якщо браузер не підтримує
 * Speech API — кнопка мікрофона не відображається.
 */
function Assistant({ onNavigate }) {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef(null);
  const recognitionRef = useRef(null);

  // Авто-прокрутка вниз при нових повідомленнях.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Створюємо екземпляр SpeechRecognition один раз при монтуванні.
  // Перестворюємо при зміні мови — щоб розпізнавання було тією ж мовою.
  useEffect(() => {
    if (!isSpeechSupported) return undefined;

    const recognition = new SpeechRecognition();
    // Мова розпізнавання = мова інтерфейсу.
    recognition.lang = language === "ru" ? "ru-RU" : "uk-UA";
    recognition.interimResults = false; // лише фінальний результат
    recognition.continuous = false; // зупиняємось після однієї фрази
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      // Беремо фінальний транскрипт.
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
      }
    };

    recognition.onerror = (event) => {
      console.warn("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
      recognitionRef.current = null;
    };
  }, [language]);

  const handleSubmit = (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg = {
      id: `u-${Date.now()}`,
      role: "user",
      text: trimmed,
    };
    const responseText = getMockResponse(trimmed, t);
    const assistantMsg = {
      id: `a-${Date.now()}`,
      role: "assistant",
      text: responseText,
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(input);
    }
  };

  const handleToggleMic = useCallback(() => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        // start() може викинути помилку, якщо вже запущено.
        console.warn("Speech recognition start error:", error);
        setIsListening(false);
      }
    }
  }, [isListening]);

  const handleClear = () => {
    setMessages([]);
    setInput("");
  };

  const isEmpty = messages.length === 0;

  return (
    <main className="assistant">
      <header className="assistant__header">
        <div className="assistant__header-top">
          {/* Кнопка закрытия чата слева */}
          <button
            type="button"
            className="assistant__close"
            onClick={() => onNavigate?.("home")}
            aria-label={t("assistant.close")}
          >
            <CloseIcon />
          </button>

          <div className="assistant__header-titles">
            <p className="assistant__eyebrow">{t("assistant.eyebrow")}</p>
            <h1 className="assistant__title">{t("assistant.title")}</h1>
          </div>

          {/* Кнопка "Нова розмова" справа (или пустой блок для выравнивания) */}
          {!isEmpty ? (
            <Button
              variant="secondary"
              className="assistant__clear"
              onClick={handleClear}
              aria-label={t("assistant.clear")}
            >
              <NewChatIcon />
              <span>{t("assistant.clear")}</span>
            </Button>
          ) : (
            <div className="assistant__header-spacer" aria-hidden="true" />
          )}
        </div>
        <p className="assistant__demo-notice">{t("assistant.demoNotice")}</p>
      </header>

      <div
        className="assistant__scroll"
        ref={scrollRef}
        role="log"
        aria-label={t("assistant.title")}
        aria-live="polite"
      >
        {isEmpty ? (
          <div className="assistant__welcome">
            <h2 className="assistant__welcome-title">
              {t("assistant.welcomeTitle")}
            </h2>
            <p className="assistant__welcome-text">
              {t("assistant.welcomeText")}
            </p>
            <div className="assistant__suggestions">
              <p className="assistant__suggestions-label">
                {t("assistant.suggestionsLabel")}
              </p>
              <div className="assistant__suggestions-grid">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className="assistant__suggestion"
                    onClick={() => handleSubmit(t(s.promptKey))}
                  >
                    {t(s.labelKey)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="assistant__messages">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`assistant__message assistant__message--${msg.role}`}
              >
                <p className="assistant__message-role">
                  {msg.role === "user"
                    ? t("assistant.userRole")
                    : t("assistant.assistantRole")}
                </p>
                <p className="assistant__message-text">{msg.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {isListening && (
        <div className="assistant__listening-indicator" role="status">
          <span className="assistant__pulse-dot" aria-hidden="true" />
          <span>{t("assistant.listening")}</span>
        </div>
      )}

      <div className="assistant__input-area">
        <div className="assistant__input-wrap">
          <input
            type="text"
            className="assistant__input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("assistant.inputPlaceholder")}
            aria-label={t("assistant.inputLabel")}
          />
          {isSpeechSupported && (
            <button
              type="button"
              className={`assistant__mic ${
                isListening ? "assistant__mic--listening" : ""
              }`.trim()}
              onClick={handleToggleMic}
              aria-label={
                isListening ? t("assistant.micStop") : t("assistant.micStart")
              }
              aria-pressed={isListening}
            >
              <MicIcon />
            </button>
          )}
          <button
            type="button"
            className="assistant__send"
            onClick={() => handleSubmit(input)}
            disabled={!input.trim()}
            aria-label={t("assistant.send")}
          >
            <SendIcon />
          </button>
        </div>
      </div>
    </main>
  );
}

export default Assistant;
