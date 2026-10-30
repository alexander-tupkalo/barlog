import './PlaceholderPage.css';
import EmptyState from '../components/ui/EmptyState';

/**
 * PlaceholderPage — заготовка для сторінок, де функціонал ще не реалізовано.
 * Використовує існуючий EmptyState та дизайн-токени.
 *
 * @param {string} eyebrow — маленький надзаголовок
 * @param {string} title — заголовок сторінки (h1)
 * @param {string} intro — короткий опис призначення сторінки
 * @param {string} emptyTitle — заголовок EmptyState
 * @param {string} emptyDescription — опис EmptyState
 */
function PlaceholderPage({ eyebrow, title, intro, emptyTitle, emptyDescription }) {
  return (
    <section className="placeholder-page">
      <header className="placeholder-page__header">
        <p className="placeholder-page__eyebrow">{eyebrow}</p>
        <h1 className="placeholder-page__title">{title}</h1>
        <p className="placeholder-page__intro">{intro}</p>
      </header>
      <div className="placeholder-page__empty">
        <EmptyState title={emptyTitle} description={emptyDescription} />
      </div>
    </section>
  );
}

export default PlaceholderPage;