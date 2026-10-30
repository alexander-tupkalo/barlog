import './CocktailCard.css';
import { useState } from 'react';
import Tag from '../ui/Tag';
import FavoriteToggle from './FavoriteToggle';
import useLanguage from '../../hooks/useLanguage';

/* Допоміжна функція: вибирає переклад для поточної мови. */
function localized(value, language) {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  return value[language] ?? value.uk ?? '';
}

/**
 * CocktailCard — картка коктейлю BARLOG.
 *
 * Структура (патерн "stretched button"):
 *   <article class="cocktail-card">
 *     <div class="cocktail-card__media">...img...</div>
 *     <div class="cocktail-card__content">...</div>
 *     <FavoriteToggle class="cocktail-card__favorite" />  ← z-index: 2
 *     <button class="cocktail-card__open" />               ← z-index: 1, покриває всю картку
 *   </article>
 *
 * Усі елементи — siblings, не вкладені. Це вирішує помилку HTML5
 * "button cannot contain a nested button".
 *
 * @param {object} cocktail — об'єкт коктейлю
 * @param {Function} onOpen — колбек при кліку на картку (відкриває деталі)
 * @param {Function} onToggleFavorite — колбек перемикання обраного
 * @param {boolean} isFavorite — чи додано цей коктейль в обране
 */
function CocktailCard({ cocktail, onOpen, onToggleFavorite, isFavorite }) {
  const { language, t } = useLanguage();

  const showOriginalName =
    cocktail.originalName && cocktail.originalName !== cocktail.name;

  const [imageFailed, setImageFailed] = useState(false);
  const hasImage = Boolean(cocktail.image) && !imageFailed;

  const favoriteAriaLabel = isFavorite
    ? `${t('favorites.remove')} ${cocktail.name}`
    : `${t('favorites.add')} ${cocktail.name}`;

  return (
    <article className="cocktail-card">
      <div className="cocktail-card__media">
        {hasImage ? (
          <img
            src={cocktail.image}
            alt={cocktail.name}
            className="cocktail-card__image"
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div
            className="cocktail-card__placeholder"
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
              className="cocktail-card__placeholder-icon"
            >
              <path d="M6 4h12l-1 6a5 5 0 0 1-10 0z" />
              <path d="M6 4H4M18 4h2" />
              <path d="M12 15v5M9 20h6" />
            </svg>
          </div>
        )}
      </div>

      <div className="cocktail-card__content">
        <header className="cocktail-card__header">
          <div className="cocktail-card__titles">
            <h3 className="cocktail-card__name">{cocktail.name}</h3>
            {showOriginalName && (
              <p className="cocktail-card__original-name">
                {cocktail.originalName}
              </p>
            )}
          </div>
          <Tag>{localized(cocktail.category, language)}</Tag>
        </header>

        {cocktail.description && (
          <p className="cocktail-card__description">
            {localized(cocktail.description, language)}
          </p>
        )}

        {cocktail.ingredients && cocktail.ingredients.length > 0 && (
          <ul className="cocktail-card__ingredients">
            {cocktail.ingredients.map((ingredient, index) => (
              <li key={index} className="cocktail-card__ingredient">
                <span className="cocktail-card__ingredient-name">
                  {localized(ingredient.name, language)}
                </span>
                <span className="cocktail-card__ingredient-amount">
                  {ingredient.amount}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Кнопка-зірка. z-index: 2 — поверх усього. */}
      <FavoriteToggle
        isFavorite={isFavorite}
        onToggle={() => onToggleFavorite(cocktail.id)}
        ariaLabel={favoriteAriaLabel}
        size="sm"
        className="cocktail-card__favorite"
      />

      {/* Stretched button — покриває всю картку, відповідає за «відкрити деталі».
          Сibling FavoriteToggle, не вкладений — HTML валідний. */}
      <button
        type="button"
        className="cocktail-card__open"
        onClick={() => onOpen(cocktail.id)}
        aria-label={cocktail.name}
      />
    </article>
  );
}

export default CocktailCard;