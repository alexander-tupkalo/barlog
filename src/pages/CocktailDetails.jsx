import './CocktailDetails.css';
import { useState } from 'react';
import Button from '../components/ui/Button';
import FavoriteToggle from '../components/cocktails/FavoriteToggle';
import useLanguage from '../hooks/useLanguage';
import { cocktails } from '../data/cocktails';

function localized(value, language) {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  return value[language] ?? value.uk ?? '';
}

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
      className="details__back-icon"
    >
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

/**
 * CocktailDetails — детальний екран рецепту коктейлю.
 *
 * @param {string} cocktailId — id обраного коктейлю
 * @param {Function} onBack — колбек повернення до бібліотеки
 * @param {Function} isFavorite — функція, що перевіряє, чи в обраному
 * @param {Function} onToggleFavorite — колбек перемикання обраного
 */
function CocktailDetails({ cocktailId, onBack, isFavorite, onToggleFavorite }) {
  const { t, language } = useLanguage();
  const [imageFailed, setImageFailed] = useState(false);

  const cocktail = cocktails.find((c) => c.id === cocktailId);

  if (!cocktail) {
    return (
      <main className="details">
        <header className="details__header">
          <Button
            variant="secondary"
            className="details__back"
            onClick={onBack}
            aria-label={t('details.back')}
          >
            <BackIcon />
            <span>{t('details.back')}</span>
          </Button>
        </header>
        <p className="details__not-found">{t('details.notFound')}</p>
      </main>
    );
  }

  const showOriginalName =
    cocktail.originalName && cocktail.originalName !== cocktail.name;
  const hasImage = Boolean(cocktail.image) && !imageFailed;
  const favorite = isFavorite(cocktail.id);

  const favoriteAriaLabel = favorite
    ? `${t('favorites.remove')} ${cocktail.name}`
    : `${t('favorites.add')} ${cocktail.name}`;

  return (
    <main className="details">
      <header className="details__header">
        <Button
          variant="secondary"
          className="details__back"
          onClick={onBack}
          aria-label={t('details.back')}
        >
          <BackIcon />
          <span>{t('details.back')}</span>
        </Button>
      </header>

      <section className="details__hero">
        <div className="details__media">
          {hasImage ? (
            <img
              src={`${import.meta.env.BASE_URL}${cocktail.image.replace(/^\//, '')}`}
              alt={cocktail.name}
              className="details__image"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div
              className="details__placeholder"
              role="img"
              aria-label={cocktail.name}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                focusable="false"
                className="details__placeholder-icon"
              >
                <path d="M6 4h12l-1 6a5 5 0 0 1-10 0z" />
                <path d="M6 4H4M18 4h2" />
                <path d="M12 15v5M9 20h6" />
              </svg>
            </div>
          )}

          {/* Зірка обраного в деталях — у правому верхньому куті фото. */}
          <FavoriteToggle
            isFavorite={favorite}
            onToggle={() => onToggleFavorite(cocktail.id)}
            ariaLabel={favoriteAriaLabel}
            size="md"
            className="details__favorite"
          />
        </div>

        <div className="details__hero-content">
          <p className="details__eyebrow">
            {localized(cocktail.category, language)}
          </p>
          <h1 className="details__name">{cocktail.name}</h1>
          {showOriginalName && (
            <p className="details__original-name">{cocktail.originalName}</p>
          )}
        </div>
      </section>

      {cocktail.description && (
        <p className="details__description">
          {localized(cocktail.description, language)}
        </p>
      )}

      <dl className="details__meta">
        <div className="details__meta-item">
          <dt className="details__meta-label">{t('details.method')}</dt>
          <dd className="details__meta-value">
            {localized(cocktail.method?.label, language)}
          </dd>
        </div>
        <div className="details__meta-item">
          <dt className="details__meta-label">{t('details.glassware')}</dt>
          <dd className="details__meta-value">
            {localized(cocktail.glassware, language)}
          </dd>
        </div>
        <div className="details__meta-item">
          <dt className="details__meta-label">{t('details.ice')}</dt>
          <dd className="details__meta-value">
            {localized(cocktail.ice, language)}
          </dd>
        </div>
        <div className="details__meta-item">
          <dt className="details__meta-label">{t('details.garnish')}</dt>
          <dd className="details__meta-value">
            {localized(cocktail.garnish, language)}
          </dd>
        </div>
      </dl>

      {cocktail.ingredients && cocktail.ingredients.length > 0 && (
        <section className="details__section">
          <h2 className="details__section-title">
            {t('details.ingredientsTitle')}
          </h2>
          <ul className="details__ingredients">
            {cocktail.ingredients.map((ingredient, index) => (
              <li key={index} className="details__ingredient">
                <span className="details__ingredient-name">
                  {localized(ingredient.name, language)}
                </span>
                <span className="details__ingredient-amount">
                  {ingredient.amount}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {cocktail.preparation && cocktail.preparation.length > 0 && (
        <section className="details__section">
          <h2 className="details__section-title">
            {t('details.preparationTitle')}
          </h2>
          <ol className="details__steps">
            {cocktail.preparation.map((step, index) => (
              <li key={index} className="details__step">
                <span className="details__step-number">{index + 1}</span>
                <span className="details__step-text">
                  {localized(step, language)}
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}
    </main>
  );
}

export default CocktailDetails;