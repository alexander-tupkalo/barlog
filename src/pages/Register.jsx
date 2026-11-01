import './Register.css';
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
      className="register__back-icon"
    >
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

/**
 * Register — екран реєстрації.
 *
 * Підтримує три способи (підготовка UI):
 *   - Google
 *   - Apple
 *   - Email + пароль + ім'я
 *
 * ВАЖЛИВО: frontend-підготовка. Реальна реєстрація не виконується.
 */
function Register({ onNavigate }) {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const next = {};
    if (!name.trim()) {
      next.name = t('auth.error.nameRequired');
    }
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
    if (!confirmPassword) {
      next.confirmPassword = t('auth.error.confirmRequired');
    } else if (confirmPassword !== password) {
      next.confirmPassword = t('auth.error.confirmMismatch');
    }
    return next;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    setSubmitted(true);
    if (Object.keys(nextErrors).length === 0) {
      // Демо-режим: реальна реєстрація не виконується.
    }
  };

  const handleSocial = (provider) => {
    // Демо-режим.
  };

  return (
    <main className="register">
      <header className="register__header">
        <Button
          variant="secondary"
          className="register__back"
          onClick={() => onNavigate('home')}
          aria-label={t('auth.backToHome')}
        >
          <BackIcon />
          <span>{t('auth.backToHome')}</span>
        </Button>

        <p className="register__eyebrow">{t('auth.eyebrow')}</p>
        <h1 className="register__title">{t('auth.register.title')}</h1>
        <p className="register__intro">{t('auth.register.intro')}</p>
      </header>

      <div className="register__body">
        <SocialAuthButtons onGoogle={() => handleSocial('google')} onApple={() => handleSocial('apple')} />

        <div className="register__divider" role="separator" aria-hidden="true">
          <span className="register__divider-text">{t('auth.or')}</span>
        </div>

        <form className="register__form" onSubmit={handleSubmit} noValidate>
          <Input
            type="text"
            label={t('auth.name')}
            placeholder={t('auth.namePlaceholder')}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
            }}
            error={errors.name}
            required
            autoComplete="name"
          />
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
            autoComplete="new-password"
          />
          <Input
            type="password"
            label={t('auth.confirmPassword')}
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errors.confirmPassword)
                setErrors((p) => ({ ...p, confirmPassword: undefined }));
            }}
            error={errors.confirmPassword}
            required
            autoComplete="new-password"
          />

          <Button type="submit" variant="primary" className="register__submit">
            {t('auth.signUp')}
          </Button>

          {submitted && Object.keys(errors).length === 0 && (
            <p className="register__demo-notice" role="status">
              {t('auth.demoNotice')}
            </p>
          )}
        </form>

        <p className="register__switch">
          {t('auth.hasAccount')}{' '}
          <button
            type="button"
            className="register__switch-link"
            onClick={() => onNavigate('login')}
          >
            {t('auth.loginLink')}
          </button>
        </p>
      </div>
    </main>
  );
}

export default Register;