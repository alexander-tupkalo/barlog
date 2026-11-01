import './Login.css';
import { useState } from 'react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import SocialAuthButtons from '../components/auth/SocialAuthButtons';
import useLanguage from '../hooks/useLanguage';
import useAuth from '../hooks/useAuth';

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
 * Login — экран входа.
 *
 * Теперь подключён к реальному PocketBase через useAuth():
 *   - signIn(email, password) — для email/пароля
 *   - signInWithOAuth('google' | 'apple') — для Google/Apple
 *
 * После успешного входа пользователь перенаправляется на Profile.
 * В случае ошибки показывается локализованное сообщение.
 */
function Login({ onNavigate }) {
  const { t } = useLanguage();
  const { signIn, signInWithOAuth, error, clearError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    clearError();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    const result = await signIn(email.trim(), password);
    setIsSubmitting(false);

    if (result.success) {
      onNavigate('profile');
    }
    // Если ошибка — она уже в error из useAuth(), отобразим ниже.
  };

  const handleSocial = async (provider) => {
    clearError();
    setIsSubmitting(true);
    const result = await signInWithOAuth(provider);
    setIsSubmitting(false);

    if (result.success) {
      onNavigate('profile');
    }
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
        <SocialAuthButtons
          onGoogle={() => handleSocial('google')}
          onApple={() => handleSocial('apple')}
        />

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
              if (error) clearError();
            }}
            error={errors.email}
            required
            autoComplete="email"
            disabled={isSubmitting}
          />
          <Input
            type="password"
            label={t('auth.password')}
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
              if (error) clearError();
            }}
            error={errors.password}
            required
            autoComplete="current-password"
            disabled={isSubmitting}
          />

          <button
            type="button"
            className="login__forgot"
            disabled={isSubmitting}
          >
            {t('auth.forgotPassword')}
          </button>

          {error && (
            <p className="login__server-error" role="alert">
              {error}
            </p>
          )}

          <Button
            type="submit"
            variant="primary"
            className="login__submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? t('auth.signingIn') : t('auth.signIn')}
          </Button>
        </form>

        <p className="login__switch">
          {t('auth.noAccount')}{' '}
          <button
            type="button"
            className="login__switch-link"
            onClick={() => onNavigate('register')}
            disabled={isSubmitting}
          >
            {t('auth.registerLink')}
          </button>
        </p>
      </div>
    </main>
  );
}

export default Login;