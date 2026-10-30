/* ============================================================
   BARLOG — mock-логіка відповідей асистента.
   Це НЕ реальна AI-модель — лише заздалегідь визначені відповіді
   на основі ключових слів у запиті користувача.
   ============================================================ */

/**
 * Повертає демонстраційну відповідь на основі ключових слів.
 *
 * @param {string} input - текст повідомлення користувача
 * @param {Function} t - функція перекладу з useLanguage
 * @returns {string} - локалізована демонстраційна відповідь
 */
export function getMockResponse(input, t) {
  const lower = (input || '').toLowerCase();

  // 1. Концепт коктейлю
  if (
    lower.includes('концепт') ||
    lower.includes('створи') ||
    lower.includes('новий') ||
    lower.includes('идею') ||
    lower.includes('ідею') ||
    lower.includes('concept')
  ) {
    return t('assistant.responseConcept');
  }

  // 2. Заміна інгредієнта
  if (
    lower.includes('замін') ||
    lower.includes('аналог') ||
    lower.includes('substitut') ||
    lower.includes('replace') ||
    lower.includes('замінити') ||
    lower.includes('заменить')
  ) {
    return t('assistant.responseSubstitution');
  }

  // 3. Баланс рецепту
  if (
    lower.includes('баланс') ||
    lower.includes('кислий') ||
    lower.includes('солодк') ||
    lower.includes('balance') ||
    lower.includes('вирівня') ||
    lower.includes('выровня')
  ) {
    return t('assistant.responseBalance');
  }

  // 4. Підготовка до зміни (раніше mise en place)
  if (
    lower.includes('підготовк') ||
    lower.includes('подготовк') ||
    lower.includes('зміну') ||
    lower.includes('смену') ||
    lower.includes('зміна') ||
    lower.includes('смена') ||
    lower.includes('mise') ||
    lower.includes('мізанплас') ||
    lower.includes('plan') ||
    lower.includes('план')
  ) {
    return t('assistant.responseMise');
  }

  // Базова відповідь
  return t('assistant.responseDefault');
}