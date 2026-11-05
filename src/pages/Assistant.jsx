import './Assistant.css';
import { useState, useRef, useEffect } from 'react';
import Button from '../components/ui/Button';
import useLanguage from '../hooks/useLanguage';
import useAuth from '../hooks/useAuth';
import useSubscription from '../hooks/useSubscription';
import { pb } from '../lib/pocketbase';

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
      focusable="false" className="assistant__icon">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
      focusable="false" className="assistant__send-icon">
      <path d="M22 2 11 13M22 2l-7 20-4-9-9-4z" />
    </svg>
  );
}

function SparklesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
      focusable="false" className="assistant__hero-icon">
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .962 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.962 0z" />
      <path d="M20 3v4M22 5h-4M4 17v2M5 18H3" />
    </svg>
  );
}

const SUGGESTIONS = [
  { key: 'suggestion1', promptKey: 'suggestion1Prompt' },
  { key: 'suggestion2', promptKey: 'suggestion2Prompt' },
  { key: 'suggestion3', promptKey: 'suggestion3Prompt' },
  { key: 'suggestion4', promptKey: 'suggestion4Prompt' },
];

function Assistant({ onNavigate }) {
  const { t } = useLanguage();
  const { user, isAuthed } = useAuth();
  const { plan, isPro } = useSubscription();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [remaining, setRemaining] = useState(null);
  const [limit, setLimit] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const canUseAI = isAuthed; // Доступно и Free, и Pro

  // Прокрутка вниз при новом сообщении
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (messageText) => {
    const text = (messageText || input).trim();
    if (!text || isLoading) return;

    // Добавляем сообщение пользователя сразу
    const userMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      // Формируем историю (последние 10 сообщений для контекста)
      const history = messages.slice(-10).map((m) => ({
        role: m.role,
        text: m.content,
      }));

      const result = await pb.send('/api/assistant', {
        method: 'POST',
        body: { message: text, history },
      });

      const aiMessage = { role: 'assistant', content: result.response };
      setMessages((prev) => [...prev, aiMessage]);
      setRemaining(result.remaining);
      setLimit(result.limit);
    } catch (err) {
      console.error('BARLOG: AI error', err);
      let errorMessage = t('assistant.errorGeneric');
      
      if (err.status === 429) {
        errorMessage = isPro 
          ? t('assistant.errorProLimit')
          : t('assistant.errorFreeLimit');
      } else if (err.status === 401) {
        errorMessage = t('assistant.errorAuth');
      } else if (err.status === 403) {
        errorMessage = t('assistant.errorProOnly');
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setMessages([]);
    setError(null);
  };

  const handleClose = () => {
    onNavigate('home');
  };

  // Если не залогинен — показываем CTA на вход
  if (!isAuthed) {
    return (
      <main className="assistant assistant--upgrade">
        <div className="assistant__hero">
          <div className="assistant__hero-icon-wrap" aria-hidden="true">
            <SparklesIcon />
          </div>
          <p className="assistant__eyebrow">{t('assistant.eyebrow')}</p>
          <h1 className="assistant__title">{t('assistant.title')}</h1>
          <p className="assistant__intro-not-authed">
            {t('assistant.notAuthedText')}
          </p>
          <div className="assistant__cta-actions">
            <Button variant="primary" onClick={() => onNavigate('login')}>
              {t('assistant.signIn')}
            </Button>
            <Button variant="secondary" onClick={() => onNavigate('register')}>
              {t('assistant.signUp')}
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="assistant">
      <header className="assistant__header">
        <div className="assistant__header-info">
          <p className="assistant__eyebrow">{t('assistant.eyebrow')}</p>
          <h1 className="assistant__title">{t('assistant.title')}</h1>
          {remaining !== null && limit !== null && (
            <p className="assistant__usage">
              {t('assistant.usageLabel')}: {remaining} / {limit}
            </p>
          )}
        </div>
        <button
          type="button"
          className="assistant__close-btn"
          onClick={handleClose}
          aria-label={t('assistant.close')}
        >
          <CloseIcon />
        </button>
      </header>

      <div className="assistant__messages">
        {messages.length === 0 && (
          <div className="assistant__welcome">
            <div className="assistant__hero-icon-wrap" aria-hidden="true">
              <SparklesIcon />
            </div>
            <h2 className="assistant__welcome-title">
              {t('assistant.welcomeTitle')}
            </h2>
            <p className="assistant__welcome-text">
              {t('assistant.welcomeText')}
            </p>
            <p className="assistant__suggestions-label">
              {t('assistant.suggestionsLabel')}
            </p>
            <div className="assistant__suggestions">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  className="assistant__suggestion"
                  onClick={() => handleSend(t(`assistant.${s.promptKey}`))}
                  disabled={isLoading}
                >
                  {t(`assistant.${s.key}`)}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`assistant__message assistant__message--${msg.role}`}
          >
            <div className="assistant__message-bubble">
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="assistant__message assistant__message--assistant">
            <div className="assistant__message-bubble assistant__message-bubble--typing">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        {error && (
          <div className="assistant__error" role="alert">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form
        className="assistant__input-form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
      >
        <textarea
          ref={inputRef}
          className="assistant__input"
          placeholder={t('assistant.inputPlaceholder')}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={isLoading}
          aria-label={t('assistant.inputLabel')}
        />
        <button
          type="submit"
          className="assistant__send-btn"
          disabled={isLoading || !input.trim()}
          aria-label={t('assistant.send')}
        >
          <SendIcon />
        </button>
      </form>
    </main>
  );
}

export default Assistant;