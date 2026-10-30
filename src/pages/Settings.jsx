import './Settings.css';
import Button from '../components/ui/Button';
import useLanguage from '../hooks/useLanguage';

const LANGUAGES = [
  { value: 'uk', short: 'UA', name: 'Українська' },
  { value: 'ru', short: 'RU', name: 'Русский' },
];

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
      className="settings__back-icon"
    >
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

/**
 * Settings — налаштування застосунку.
 *
 * Містить:
 *   - Перемикач мови інтерфейсу (UA / RU).
 *   - Розділ «Про BARLOG» з описом застосунку.
 *
 * Мова зберігається через існуючий LanguageContext — дублювання стану немає.
 */
function Settings({ onNavigate }) {
  const { t, language, setLanguage } = useLanguage();

  return (
    <main className="settings">
      <header className="settings__header">
        <Button
          variant="secondary"
          className="settings__back"
          onClick={() => onNavigate('library')}
          aria-label={t('settings.backToLibrary')}
        >
          <BackIcon />
          <span>{t('settings.backToLibrary')}</span>
        </Button>

        <p className="settings__eyebrow">{t('settings.eyebrow')}</p>
        <h1 className="settings__title">{t('settings.title')}</h1>
      </header>

      {/* ---- Мова інтерфейсу ---- */}
      <section className="settings__section">
        <h2 className="settings__section-title">
          {t('settings.languageLabel')}
        </h2>
        <p className="settings__section-hint">
          {t('settings.languageHint')}
        </p>
        <div
          className="settings__languages"
          role="group"
          aria-label={t('settings.languageLabel')}
        >
          {LANGUAGES.map((lang) => {
            const isActive = language === lang.value;
            return (
              <button
                key={lang.value}
                type="button"
                className={`settings__lang-btn ${
                  isActive ? 'settings__lang-btn--active' : ''
                }`.trim()}
                aria-pressed={isActive}
                onClick={() => setLanguage(lang.value)}
              >
                <span className="settings__lang-short">{lang.short}</span>
                <span className="settings__lang-name">{lang.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ---- Про BARLOG ---- */}
      <section className="settings__section">
        <h2 className="settings__section-title">{t('settings.aboutTitle')}</h2>
        <div className="settings__about">
          <p className="settings__about-name">BARLOG</p>
          <p className="settings__about-description">
            {t('settings.aboutDescription')}
          </p>
          <p className="settings__version">
            {t('settings.versionLabel')}: 0.1.0
          </p>
        </div>
      </section>
    </main>
  );
}

export default Settings;