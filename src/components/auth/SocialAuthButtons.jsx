import './SocialAuthButtons.css';
import useLanguage from '../../hooks/useLanguage';

/* Іконка Google — офіційні 4 кольори бренду. */
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="social-auth__icon" aria-hidden="true" focusable="false">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
    </svg>
  );
}

/* Іконка Apple — одноколірна, використовує currentColor. */
function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="social-auth__icon" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M17.05 12.04c-.03-2.86 2.34-4.24 2.44-4.31-1.33-1.95-3.4-2.22-4.14-2.25-1.76-.18-3.44 1.04-4.34 1.04-.91 0-2.27-1.02-3.74-.99-1.92.03-3.7 1.12-4.69 2.84-2.01 3.49-.51 8.65 1.44 11.48.96 1.39 2.1 2.95 3.59 2.9 1.44-.06 1.99-.93 3.73-.93 1.74 0 2.23.93 3.75.9 1.55-.03 2.53-1.41 3.48-2.81 1.1-1.62 1.55-3.21 1.58-3.29-.03-.02-3.03-1.16-3.06-4.62M14.34 3.5c.79-.96 1.32-2.29 1.18-3.62-1.14.05-2.52.76-3.34 1.72-.73.85-1.37 2.21-1.2 3.51 1.27.1 2.57-.65 3.36-1.61"/>
    </svg>
  );
}

/**
 * SocialAuthButtons — кнопки входу через Google та Apple.
 *
 * @param {Function} onGoogle — колбек для Google
 * @param {Function} onApple — колбек для Apple
 * @param {string} [className='']
 */
function SocialAuthButtons({ onGoogle, onApple, className = '' }) {
  const { t } = useLanguage();

  return (
    <div className={`social-auth ${className}`.trim()}>
      <button
        type="button"
        className="social-auth__btn social-auth__btn--google"
        onClick={onGoogle}
      >
        <GoogleIcon />
        <span>{t('auth.continueWithGoogle')}</span>
      </button>

      <button
        type="button"
        className="social-auth__btn social-auth__btn--apple"
        onClick={onApple}
      >
        <AppleIcon />
        <span>{t('auth.continueWithApple')}</span>
      </button>
    </div>
  );
}

export default SocialAuthButtons;