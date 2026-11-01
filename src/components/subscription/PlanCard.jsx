import './PlanCard.css';
import Button from '../ui/Button';
import { SUBSCRIPTION_PLANS } from '../../utils/subscriptionStorage';

/**
 * PlanCard — картка плану підписки.
 *
 * @param {'free'|'pro'} plan — який план показує картка
 * @param {string} title — заголовок (наприклад, "BARLOG Free")
 * @param {string} price — ціна (наприклад, "$0" або "$9")
 * @param {string} period — період (наприклад, "/місяць")
 * @param {string} description — короткий опис плану
 * @param {Array<{text: string, included: boolean}>} features — список фіч
 * @param {boolean} [isCurrent=false] — чи це поточний план користувача
 * @param {boolean} [isHighlighted=false] — підсвітити як рекомендований
 * @param {Function} [onAction] — колбек кнопки
 * @param {string} [actionLabel] — текст кнопки
 * @param {string} [footerNote] — дрібна примітка знизу
 * @param {string} [className='']
 */
function PlanCard({
  plan,
  title,
  price,
  period,
  description,
  features = [],
  isCurrent = false,
  isHighlighted = false,
  onAction,
  actionLabel,
  footerNote,
  className = '',
}) {
  const classes = [
    'plan-card',
    `plan-card--${plan}`,
    isHighlighted ? 'plan-card--highlighted' : '',
    isCurrent ? 'plan-card--current' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <article className={classes}>
      {isHighlighted && (
        <span className="plan-card__ribbon">
          {plan === SUBSCRIPTION_PLANS.PRO ? 'Рекомендовано' : ''}
        </span>
      )}

      <header className="plan-card__header">
        <h3 className="plan-card__title">{title}</h3>
        {description && (
          <p className="plan-card__description">{description}</p>
        )}
      </header>

      <div className="plan-card__price-row">
        <span className="plan-card__price">{price}</span>
        {period && <span className="plan-card__period">{period}</span>}
      </div>

      {features.length > 0 && (
        <ul className="plan-card__features">
          {features.map((feature, index) => (
            <li
              key={index}
              className={`plan-card__feature ${
                feature.included ? '' : 'plan-card__feature--excluded'
              }`.trim()}
            >
              <span className="plan-card__feature-icon" aria-hidden="true">
                {feature.included ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                )}
              </span>
              <span className="plan-card__feature-text">{feature.text}</span>
            </li>
          ))}
        </ul>
      )}

      {onAction && actionLabel && (
        <div className="plan-card__action">
          <Button
            variant={plan === SUBSCRIPTION_PLANS.PRO ? 'primary' : 'secondary'}
            onClick={onAction}
            disabled={isCurrent}
            className="plan-card__button"
          >
            {isCurrent ? 'Поточний план' : actionLabel}
          </Button>
        </div>
      )}

      {footerNote && <p className="plan-card__footer-note">{footerNote}</p>}
    </article>
  );
}

export default PlanCard;