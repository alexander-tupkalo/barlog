import './Home.css';
import { useState } from 'react';
import Button from '../components/ui/Button';
import CocktailSearch from '../components/cocktails/CocktailSearch';
import useLanguage from '../hooks/useLanguage';

function Home({ onNavigate, onOpenCocktail }) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="home-wrapper">
      {/* Фоновое фото — растянуто на весь верхний блок. */}
      <div className="home__bg" aria-hidden="true" />

      {/* Глобальный поиск — на полупрозрачной капсуле поверх фона. */}
      <section className="home-search" aria-label={t('globalSearch.label')}>
        <div className="home-search__inner">
          <CocktailSearch
            value={searchQuery}
            onChange={setSearchQuery}
            onOpenCocktail={onOpenCocktail}
          />
        </div>
      </section>

      {/* Когда поиск активен — скрываем hero. */}
      {!isSearching && (
        <section className="home">
          <p className="home__eyebrow">{t('home.eyebrow')}</p>
          <h1 className="home__wordmark">BARLOG</h1>
          <div className="home__rule" aria-hidden="true" />
          <p className="home__tagline">{t('home.tagline')}</p>
          <p className="home__description">{t('home.description')}</p>
          <Button variant="primary" onClick={() => onNavigate('library')}>
            {t('home.cta')}
          </Button>
        </section>
      )}
    </div>
  );
}

export default Home;