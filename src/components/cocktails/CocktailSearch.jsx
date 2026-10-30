import './CocktailSearch.css';
import { useMemo } from 'react';
import Tag from '../ui/Tag';
import useLanguage from '../../hooks/useLanguage';
import { cocktails } from '../../data/cocktails';
import { IBA_COLLECTIONS } from '../../data/ibaCollections';
import { searchCocktails } from '../../utils/cocktailSearch';

/* Іконка пошуку (лупа). */
function SearchIcon() {
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
      className="cocktail-search__icon"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

/* Іконка закриття (хрестик) для кнопки очищення. */
function ClearIcon() {
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
      className="cocktail-search__clear-icon"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

/**
 * CocktailSearch — глобальний пошук коктейлів.
 *
 * Іконки розташовані справа:
 *   - Коли поле порожнє — показується лупа.
 *   - Коли є текст — лупа змінюється на кнопку-хрестик для очищення.
 *
 * Поле вводу використовує type="text", а не type="search", щоб уникнути
 * задвоєння іконок від нативних браузерних стилів.
 */
function CocktailSearch({ value, onChange, onOpenCocktail }) {
  const { t } = useLanguage();
  const isSearching = value.trim().length > 0;

  const results = useMemo(
    () => searchCocktails(value, cocktails),
    [value]
  );

  const handleClear = () => {
    onChange('');
  };

  const handleResultClick = (cocktailId) => {
    if (onOpenCocktail) {
      onOpenCocktail(cocktailId);
    }
  };

  return (
    <div className="cocktail-search" role="search">
      <div className="cocktail-search__field">
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={t('globalSearch.placeholder')}
          aria-label={t('globalSearch.label')}
          className="cocktail-search__input"
          autoComplete="off"
        />

        {/* Іконка справа: лупа коли порожньо, хрестик коли є запит. */}
        {isSearching ? (
          <button
            type="button"
            className="cocktail-search__clear"
            onClick={handleClear}
            aria-label={t('globalSearch.clear')}
          >
            <ClearIcon />
          </button>
        ) : (
          <span className="cocktail-search__icon-wrapper" aria-hidden="true">
            <SearchIcon />
          </span>
        )}
      </div>

      {isSearching && (
        <div className="cocktail-search__results">
          {results.length === 0 ? (
            <p className="cocktail-search__no-results">
              {t('globalSearch.noResults')}
            </p>
          ) : (
            <>
              <p className="cocktail-search__count">
                {t('globalSearch.resultsCount')} {results.length}
              </p>
              <ul className="cocktail-search__list">
                {results.map((cocktail) => {
                  const collection = IBA_COLLECTIONS.find(
                    (c) => c.id === cocktail.ibaCategory
                  );
                  const showOriginalName =
                    cocktail.originalName &&
                    cocktail.originalName !== cocktail.name;
                  return (
                    <li key={cocktail.id} className="cocktail-search__item-wrapper">
                      <button
                        type="button"
                        className="cocktail-search__item"
                        onClick={() => handleResultClick(cocktail.id)}
                      >
                        <span className="cocktail-search__item-titles">
                          <span className="cocktail-search__item-name">
                            {cocktail.name}
                          </span>
                          {showOriginalName && (
                            <span className="cocktail-search__item-original">
                              {cocktail.originalName}
                            </span>
                          )}
                        </span>
                        {collection && (
                          <Tag>{collection.name}</Tag>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default CocktailSearch;