import './Login.css';
import { useState } from 'react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import SocialAuthButtons from '../components/auth/SocialAuthButtons';
import useLanguage from '../hooks/useLanguage';

function BackIcon() {
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
      className="login__back-icon"
    >
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

/**
 * Login — екран входу.
 *
 * Підтримує три способи входу (підготовка UI):
 *   - Google
 *   - Apple
 *   - Email + пароль
 *
 * ВАЖЛИВО: це лише frontend-підготовка. Реальна авторизація не
 * виконується — кнопки не викликають жодного бекенду чи OAuth.
 */
function Login({ onNavigate }) {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const next = {};
    if (!email.trim()) {
      next.email = t('auth.error.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = t('auth.error.emailInvalid');
    }
    if (!password) {
      next.password = t('auth.error.passwordRequired');
    } else if (password.length < 6) {
      next.password = t('auth.error.passwordTooShort');
    }
    return next;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    setSubmitted(true);
    if (Object.keys(nextErrors).length === 0) {
      // Демо-режим: реальна авторизація не виконується.
      // У майбутньому тут буде виклик AuthContext.signIn().
    }
  };

  const handleSocial = (provider) => {
    // Демо-режим: OAuth-флоу не запускається.
    // У майбутньому: AuthContext.signIn(provider).
  };

  return (
    <main className="login">
      <header className="login__header">
        <Button
          variant="secondary"
          className="login__back"
          onClick={() => onNavigate('home')}
          aria-label={t('auth.backToHome')}
        >
          <BackIcon />
          <span>{t('auth.backToHome')}</span>
        </Button>

        <p className="login__eyebrow">{t('auth.eyebrow')}</p>
        <h1 className="login__title">{t('auth.login.title')}</h1>
        <p className="login__intro">{t('auth.login.intro')}</p>
      </header>

      <div className="login__body">
        <SocialAuthButtons onGoogle={() => handleSocial('google')} onApple={() => handleSocial('apple')} />

        <div className="login__divider" role="separator" aria-hidden="true">
          <span className="login__divider-text">{t('auth.or')}</span>
        </div>

        <form className="login__form" onSubmit={handleSubmit} noValidate>
          <Input
            type="email"
            label={t('auth.email')}
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
            }}
            error={errors.email}
            required
            autoComplete="email"
          />
          <Input
            type="password"
            label={t('auth.password')}
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
            }}
            error={errors.password}
            required
            autoComplete="current-password"
          />

          <button type="button" className="login__forgot">
            {t('auth.forgotPassword')}
          </button>

          <Button type="submit" variant="primary" className="login__submit">
            {t('auth.signIn')}
          </Button>

          {submitted && Object.keys(errors).length === 0 && (
            <p className="login__demo-notice" role="status">
              {t('auth.demoNotice')}
            </p>
          )}
        </form>

        <p className="login__switch">
          {t('auth.noAccount')}{' '}
          <button
            type="button"
            className="login__switch-link"
            onClick={() => onNavigate('register')}
          >
            {t('auth.registerLink')}
          </button>
        </p>
      </div>
    </main>
  );
}

export default Login;