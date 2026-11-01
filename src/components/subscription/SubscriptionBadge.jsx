import './SubscriptionBadge.css';
import { SUBSCRIPTION_PLANS } from '../../utils/subscriptionStorage';

/**
 * SubscriptionBadge — компактний індикатор плану підписки.
 *
 * @param {'free'|'pro'} plan — поточний план
 * @param {string} [size='md'] — 'sm' (у шапці/картці) або 'md' (на сторінках)
 * @param {string} [className=''] — додаткові класи
 */
function SubscriptionBadge({ plan, size = 'md', className = '' }) {
  const isPro = plan === SUBSCRIPTION_PLANS.PRO;

  const classes = [
    'subscription-badge',
    `subscription-badge--${plan}`,
    `subscription-badge--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes} aria-label={`BARLOG ${isPro ? 'Pro' : 'Free'}`}>
      <span className="subscription-badge__dot" aria-hidden="true" />
      <span className="subscription-badge__text">
        BARLOG {isPro ? 'Pro' : 'Free'}
      </span>
    </span>
  );
}

export default SubscriptionBadge;