import './Upgrade.css';
import Button from '../components/ui/Button';
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
      className="upgrade__back-icon"
    >
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

function SparklesIcon() {
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
      className="upgrade__hero-icon"
    >
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .962 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.962 0z" />
      <path d="M20 3v4" />
      <path d="M22 5h-4" />
      <path d="M4 17v2" />
      <path d="M5 18H3" />
    </svg>
  );
}

/**
 * Upgrade — екран апгрейду для Pro-функцій.
 *
 * Використовується, коли Free-користувач намагається відкрити
 * AI Bartender або Препарати. Показує опис функції, ціну Pro
 * та заклик до переходу на сторінку планів.
 *
 * @param {string} [feature='generic'] — 'assistant' | 'prep' | 'generic'
 * @param {Function} onNavigate — для переходу на сторінку підписки
 */
function Upgrade({ feature = 'generic', onNavigate }) {
  const { t } = useLanguage();

  // Вибираємо текстові ключі залежно від функції.
  const titleKey = `upgrade.${feature}.title`;
  const descriptionKey = `upgrade.${feature}.description`;
  const featuresKey = `upgrade.${feature}.features`;

  // Масив фіч — береться з перекладу як масив рядків.
  // У translations.js структура: upgrade.assistant.features: ['...', '...']
  const featuresList = t(featuresKey);
  const featuresArray = Array.isArray(featuresList) ? featuresList : [];

  return (
    <main className="upgrade">
      <header className="upgrade__header">
        <Button
          variant="secondary"
          className="upgrade__back"
          onClick={() => onNavigate('home')}
          aria-label={t('upgrade.backToHome')}
        >
          <BackIcon />
          <span>{t('upgrade.backToHome')}</span>
        </Button>
      </header>

      <div className="upgrade__content">
        <div className="upgrade__hero">
          <div className="upgrade__hero-icon-wrap" aria-hidden="true">
            <SparklesIcon />
          </div>
          <p className="upgrade__eyebrow">{t('upgrade.eyebrow')}</p>
          <h1 className="upgrade__title">{t(titleKey)}</h1>
          <p className="upgrade__description">{t(descriptionKey)}</p>
        </div>

        {featuresArray.length > 0 && (
          <ul className="upgrade__features">
            {featuresArray.map((featureText, index) => (
              <li key={index} className="upgrade__feature">
                <span className="upgrade__feature-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </span>
                <span className="upgrade__feature-text">{featureText}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="upgrade__price-block">
          <p className="upgrade__price-label">{t('upgrade.priceLabel')}</p>
          <div className="upgrade__price-row">
            <span className="upgrade__price">$9</span>
            <span className="upgrade__price-period">{t('upgrade.pricePeriod')}</span>
          </div>
        </div>

        <div className="upgrade__actions">
          <Button
            variant="primary"
            className="upgrade__cta"
            onClick={() => onNavigate('subscription')}
          >
            {t('upgrade.cta')}
          </Button>
          <Button
            variant="secondary"
            className="upgrade__secondary"
            onClick={() => onNavigate('home')}
          >
            {t('upgrade.later')}
          </Button>
        </div>

        <p className="upgrade__demo-notice">{t('upgrade.demoNotice')}</p>
      </div>
    </main>
  );
}

export default Upgrade;