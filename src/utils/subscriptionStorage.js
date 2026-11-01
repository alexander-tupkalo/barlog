/* ============================================================
   BARLOG — сховище підписки.
   localStorage-обгортка для плану підписки користувача.

   Конвенція ключів: barlog-<feature>
   ============================================================ */

export const SUBSCRIPTION_STORAGE_KEY = 'barlog-subscription';

export const SUBSCRIPTION_PLANS = {
  FREE: 'free',
  PRO: 'pro',
};

/* Валідні плани — захист від пошкоджених даних у localStorage. */
const VALID_PLANS = [SUBSCRIPTION_PLANS.FREE, SUBSCRIPTION_PLANS.PRO];

/**
 * Безпечно читає план підписки з localStorage.
 * Повертає 'free' за замовчуванням, якщо дані пошкоджені.
 *
 * @returns {'free'|'pro'} поточний план підписки
 */
export function loadSubscription() {
  if (typeof window === 'undefined') return SUBSCRIPTION_PLANS.FREE;
  try {
    const ls = window.localStorage;
    if (!ls) return SUBSCRIPTION_PLANS.FREE;
    const raw = ls.getItem(SUBSCRIPTION_STORAGE_KEY);
    if (!raw) return SUBSCRIPTION_PLANS.FREE;
    if (!VALID_PLANS.includes(raw)) {
      // Пошкоджено — скидаємо до free, не кидаємо.
      return SUBSCRIPTION_PLANS.FREE;
    }
    return raw;
  } catch (error) {
    console.warn('BARLOG: не вдалося прочитати підписку з localStorage', error);
    return SUBSCRIPTION_PLANS.FREE;
  }
}

/**
 * Безпечно зберігає план підписки в localStorage.
 * Ігнорує невалідні значення.
 *
 * @param {'free'|'pro'} plan — план для збереження
 * @returns {boolean} true при успіху
 */
export function saveSubscription(plan) {
  if (typeof window === 'undefined') return false;
  if (!VALID_PLANS.includes(plan)) {
    console.warn(`BARLOG: невалідний план підписки "${plan}" — ігноруємо`);
    return false;
  }
  try {
    const ls = window.localStorage;
    if (!ls) return false;
    ls.setItem(SUBSCRIPTION_STORAGE_KEY, plan);
    // Сповіщаємо інші вкладки/компоненти про зміну підписки.
    // useSubscription слухає цю подію та оновлює стан.
    window.dispatchEvent(
      new CustomEvent('barlog:subscription-change', { detail: { plan } })
    );
    return true;
  } catch (error) {
    console.warn('BARLOG: не вдалося зберегти підписку в localStorage', error);
    return false;
  }
}

/**
 * Допоміжна: перевіряє, чи план є Pro.
 * Використовується в gate-логіці.
 */
export function isProPlan(plan) {
  return plan === SUBSCRIPTION_PLANS.PRO;
}