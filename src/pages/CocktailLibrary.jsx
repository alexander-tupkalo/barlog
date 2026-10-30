import './CocktailLibrary.css';
import { useState, useMemo } from 'react';
import { cocktails } from '../data/cocktails';
import { IBA_COLLECTIONS } from '../data/ibaCollections';
import CocktailCard from '../components/cocktails/CocktailCard';
import CocktailSearch from '../components/cocktails/CocktailSearch';
import EmptyState from '../components/ui/EmptyState';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import useLanguage from '../hooks/useLanguage';

/* Тонка стрілка «назад» для кнопки повернення. */
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
      className="library__back-icon"
    >
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

/* Іконка зірки для картки «Обране». */
function StarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className="library-collection-card__star-icon"
    >
      <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  );
}

/**
 * Допоміжна функція для слов'янського плюралізування. */
function pluralize(count, one, few, many) {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}

function CocktailLibrary({
  onOpenCocktail,
  favoriteIds,
  onToggleFavorite,
  isFavorite,
}) {
  const { t } = useLanguage();
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [showFavorites, setShowFavorites] = useState(false);

  const isGlobalSearching = globalSearchQuery.trim().length > 0;
  const isSearching = searchQuery.trim().length > 0;

  /* Коктейлі поточної колекції. */
  const collectionCocktails = useMemo(() => {
    if (!selectedCollection) return [];
    return cocktails.filter(
      (cocktail) => cocktail.ibaCategory === selectedCollection
    );
  }, [selectedCollection]);

  /* Фільтрація за пошуком всередині колекції. */
  const filteredCocktails = useMemo(() => {
    if (!isSearching) return collectionCocktails;
    const query = searchQuery.trim().toLowerCase();
    return collectionCocktails.filter((cocktail) => {
      const name = cocktail.name.toLowerCase();
      const originalName = (cocktail.originalName || '').toLowerCase();
      return name.includes(query) || originalName.includes(query);
    });
  }, [collectionCocktails, searchQuery, isSearching]);

  /* Усі обрані коктейлі (з усіх категорій). */
  const allFavoriteCocktails = useMemo(() => {
    return cocktails.filter((cocktail) => favoriteIds.includes(cocktail.id));
  }, [favoriteIds]);

  /* Фільтрація обраних за пошуком. */
  const filteredFavoriteCocktails = useMemo(() => {
    if (!isSearching) return allFavoriteCocktails;
    const query = searchQuery.trim().toLowerCase();
    return allFavoriteCocktails.filter((cocktail) => {
      const name = cocktail.name.toLowerCase();
      const originalName = (cocktail.originalName || '').toLowerCase();
      return name.includes(query) || originalName.includes(query);
    });
  }, [allFavoriteCocktails, searchQuery, isSearching]);

  const matchCount = showFavorites
    ? filteredFavoriteCocktails.length
    : filteredCocktails.length;
  const hasNoMatches = isSearching && matchCount === 0;
  const isCollectionEmpty = collectionCocktails.length === 0;
  const isFavoritesEmpty = showFavorites && allFavoriteCocktails.length === 0;

  /* Текст лічильника. */
  const countText = (() => {
    const count = showFavorites
      ? allFavoriteCocktails.length
      : collectionCocktails.length;
    return `${count} ${pluralize(
      count,
      t('library.countSingular'),
      t('library.countFew'),
      t('library.countMany')
    )}`;
  })();

  const currentCollection = IBA_COLLECTIONS.find(
    (collection) => collection.id === selectedCollection
  );

  // ----- Рендер: лендинг колекцій -----
  if (!selectedCollection && !showFavorites) {
    return (
      <main className="library library--landing">
        <div className="library__global-search">
          <CocktailSearch
            value={globalSearchQuery}
            onChange={setGlobalSearchQuery}
            onOpenCocktail={onOpenCocktail}
          />
        </div>

        {!isGlobalSearching && (
          <>
            <section className="library-hero">
              <div className="library-hero__inner">
                <p className="library-hero__eyebrow">{t('library.eyebrow')}</p>
                <h1 className="library-hero__title">IBA COCKTAILS</h1>
                <p className="library-hero__intro">
                  {t('library.landingIntro')}
                </p>
              </div>
            </section>

            <section className="library-collections" aria-label={t('library.collectionsAriaLabel')}>
              {/* Три колекції IBA — спочатку */}
              {IBA_COLLECTIONS.map((collection) => (
                <article
                  key={collection.id}
                  className="library-collection-card"
                  data-collection={collection.id}
                >
                  <div className="library-collection-card__body">
                    <h2 className="library-collection-card__name">
                      {collection.name}
                    </h2>
                    <p className="library-collection-card__description">
                      {t(collection.descriptionKey)}
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    onClick={() => {
                      setSelectedCollection(collection.id);
                      setSearchQuery('');
                    }}
                    aria-label={`${t('library.openCollection')} ${collection.name}`}
                  >
                    {t('library.openCollection')}
                  </Button>
                </article>
              ))}

              {/* Картка «Обране» — остання в сітці.
                  Окрема від IBA-категорій: теракотовий фон, іконка зірки.
                  Опис змінюється: при порожньому списку — прохання додати перший рецепт. */}
              <article
                className="library-collection-card library-collection-card--favorites"
                data-collection="favorites"
              >
                <div className="library-collection-card__body">
                  <div className="library-collection-card__star-wrap">
                    <StarIcon />
                  </div>
                  <h2 className="library-collection-card__name">
                    {t('favorites.collectionTitle')}
                  </h2>
                  <p className="library-collection-card__description">
                    {allFavoriteCocktails.length > 0
                      ? t('favorites.collectionIntro')
                      : t('favorites.collectionEmpty')}
                  </p>
                </div>
                <Button
                  variant="primary"
                  onClick={() => {
                    setShowFavorites(true);
                    setSearchQuery('');
                  }}
                  aria-label={t('favorites.open')}
                >
                  {allFavoriteCocktails.length > 0
                    ? `${t('favorites.open')} (${allFavoriteCocktails.length})`
                    : t('favorites.open')}
                </Button>
              </article>
            </section>
          </>
        )}
      </main>
    );
  }

  // ----- Рендер: список коктейлів (колекція або обране) -----
  const listCocktails = showFavorites
    ? filteredFavoriteCocktails
    : filteredCocktails;

  return (
    <main className="library">
      <header className="library__header">
        <Button
          variant="secondary"
          className="library__back"
          onClick={() => {
            setSelectedCollection(null);
            setShowFavorites(false);
            setSearchQuery('');
          }}
          aria-label={t('library.backToCollections')}
        >
          <BackIcon />
          <span>{t('library.backToCollections')}</span>
        </Button>

        <p className="library__eyebrow">
          {showFavorites ? t('favorites.eyebrow') : t('library.eyebrow')}
        </p>
        <h1 className="library__title">
          {showFavorites
            ? t('favorites.collectionTitle')
            : currentCollection
            ? currentCollection.name
            : t('library.title')}
        </h1>
        <p className="library__intro">
          {showFavorites ? t('favorites.collectionIntro') : t('library.intro')}
        </p>
        {!(showFavorites && isFavoritesEmpty) && (
          <p className="library__count">{countText}</p>
        )}
      </header>

      {!isFavoritesEmpty && (
        <div className="library__search">
          <Input
            label={t('library.searchLabel')}
            type="search"
            placeholder={t('library.searchPlaceholder')}
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>
      )}

      {isFavoritesEmpty ? (
        <EmptyState
          title={t('favorites.emptyTitle')}
          description={t('favorites.emptyDescription')}
          actionLabel={t('favorites.browseCollections')}
          onAction={() => {
            setShowFavorites(false);
            setSearchQuery('');
          }}
        />
      ) : hasNoMatches ? (
        <EmptyState
          title={t('library.searchEmptyTitle')}
          description={t('library.searchEmptyDescription')}
        />
      ) : (
        <div className="library__grid">
          {listCocktails.map((cocktail) => (
            <CocktailCard
              key={cocktail.id}
              cocktail={cocktail}
              onOpen={onOpenCocktail}
              onToggleFavorite={onToggleFavorite}
              isFavorite={isFavorite(cocktail.id)}
            />
          ))}
        </div>
      )}
    </main>
  );
}

export default CocktailLibrary;