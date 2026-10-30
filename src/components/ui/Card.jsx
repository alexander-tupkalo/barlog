import './Card.css';

/**
 * Кард-контейнер BARLOG.
 *
 * @param {string} [title] — заголовок картки (рендериться як <h2>)
 * @param {React.ReactNode} children — вміст картки
 */
function Card({ title, children, className = '' }) {
  return (
    <section className={`card ${className}`.trim()}>
      {title && <h2 className="card__title">{title}</h2>}
      <div className="card__body">
        {children}
      </div>
    </section>
  );
}

export default Card;