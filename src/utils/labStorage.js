/* ============================================================
   BARLOG — сховище особистих рецептів (My Lab).
   Чисті функції для читання/запису масиву рецептів у localStorage.
   Не залежить від React — легко тестується.

   Конвенція ключів у проєкті: barlog-<feature>
   (barlog-favorites, barlog-language, barlog-profile).
   ============================================================ */

const LAB_RECIPES_STORAGE_KEY = 'barlog-mylab-recipes';

/**
 * Перевіряє, що об'єкт є валідним записом рецепту.
   Має містити непорожні рядкові поля `id` та `name`.
   Решта полів (ingredients, preparation, method тощо) опціональні
   на цьому етапі — це дозволяє майбутні розширення моделі
   без ломання збережених даних.
 */
function isValidRecipe(entry) {
  return (
    entry !== null &&
    typeof entry === 'object' &&
    !Array.isArray(entry) &&
    typeof entry.id === 'string' &&
    entry.id.trim().length > 0 &&
    typeof entry.name === 'string' &&
    entry.name.trim().length > 0
  );
}

/**
 * Безпечно читає збережені рецепти з localStorage.
 *
   Повертає масив рецептів. Повертає [] у таких випадках:
     - localStorage недоступний (SSR, приватний режим, sandboxed iframe)
     - доступ до властивості window.localStorage кидає виняток
     - ключ відсутній (перший візит)
     - значення не є валідним JSON (пошкоджені дані)
     - розпарсене значення не є масивом
     - елементи масиву не проходять базову валідацію

   УСЕ звернення до window.localStorage (включно з доступом
   до самої властивості) знаходиться всередині try/catch —
   це захищає від sandboxed-середовищ, де навіть зчитування
   властивості може кинути виняток.

   typeof window === 'undefined' — безпечна перевірка, яка
   ніколи не кидає (typeof на неіснуючій змінній повертає рядок),
   тому її тримаємо поза try — це швидкий вихід для SSR.
 *
 * @returns {Array} масив рецептів (може бути порожнім)
 */
export function loadLabRecipes() {
  if (typeof window === 'undefined') return [];
  try {
    // Доступ до властивості localStorage може кидати в sandboxed iframes.
    const ls = window.localStorage;
    if (!ls) return [];
    const raw = ls.getItem(LAB_RECIPES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Фільтруємо явно невалідні записи (відсутній id або name).
    // Не викидаємо рецепти через відсутність опціональних полів.
    return parsed.filter(isValidRecipe);
  } catch (error) {
    console.warn(
      'BARLOG: не вдалося прочитати рецепти My Lab з localStorage',
      error
    );
    return [];
  }
}

/**
 * Безпечно зберігає масив рецептів у localStorage.
 *
 * @param {Array} recipes — масив рецептів для збереження.
   Усе звернення до window.localStorage всередині try/catch —
   захищає від приватних режимів та перевищення квоти.
 */
export function saveLabRecipes(recipes) {
  if (typeof window === 'undefined') return;
  try {
    const ls = window.localStorage;
    if (!ls) return;
    ls.setItem(LAB_RECIPES_STORAGE_KEY, JSON.stringify(recipes));
  } catch (error) {
    // Не критично — сесія продовжиться з рецептами в пам'яті.
    // Може статися при перевищенні квоти або в приватному режимі.
    console.warn(
      'BARLOG: не вдалося зберегти рецепти My Lab у localStorage',
      error
    );
  }
}