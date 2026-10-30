/* ============================================================
   BARLOG — помощник поиска коктейлей.
   Чистая функция: не зависит от React, легко тестируется.
   ============================================================ */

/**
 * Пошук коктейлів за запитом.
 *
 * Шукає за полями:
 *   - cocktail.name (відображуване ім'я, будь-якою мовою)
 *   - cocktail.originalName (англійський оригінал)
 *   - cocktail.category.uk (українська категорія)
 *   - cocktail.category.ru (російська категорія)
 *
 * Працює незалежно від поточної мови інтерфейсу: користувач може
 * вводити запит українською чи російською, навіть якщо інтерфейс
 * зараз показує іншу мову. Англійські оригінальні назви також
 * доступні для пошуку.
 *
 * @param {string} query — пошуковий запит (може містити пробіли)
 * @param {Array} cocktailList — масив коктейлів для пошуку
 * @returns {Array} відфільтрований масив. Порожній, якщо запит порожній або нічого не знайдено.
 */
export function searchCocktails(query, cocktailList) {
  const trimmed = (query || '').trim().toLowerCase();
  if (!trimmed) return [];
  if (!cocktailList || cocktailList.length === 0) return [];

  return cocktailList.filter((cocktail) => {
    const haystack = [
      cocktail.name,
      cocktail.originalName,
      cocktail.category?.uk,
      cocktail.category?.ru,
    ]
      .filter(Boolean)
      .map((s) => s.toLowerCase())
      .join(' ');

    return haystack.includes(trimmed);
  });
}