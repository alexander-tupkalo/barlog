/* ============================================================
   BARLOG — парсер кількості інгредієнта.
   Чиста функція: без DOM, React, localStorage, мережі.
   Не кидає винятків — завжди повертає { value, isScalable }.
   ============================================================ */

/**
 * Безпечно парсить рядок кількості інгредієнта.
 *
   Підтримує:
     - цілі числа: "30", "2"
     - десяткові з крапкою або комою: "1.5", "1,5"
     - прості дроби: "1/2", "3/4"
     - змішані числа: "1 1/2", "2 3/4"
     - число з описовим текстом: "2 dashes", "30 ml", "1.5 oz"

   Завжди повертає об'єкт:
     { value: number | null, isScalable: boolean }

   isScalable: true ТІЛЬКИ коли значення можна надійно масштабувати.
   "to taste", "a splash", "" — не масштабуються.
 *
 * @param {string|null|undefined} amountString — вхідний рядок
 * @returns {{value: number|null, isScalable: boolean}}
 */
export function parseAmount(amountString) {
  // 1. Захист від null/undefined/не-рядків.
  if (typeof amountString !== 'string') {
    return { value: null, isScalable: false };
  }

  // 2. Trim — прибираємо пробіли по краях.
  const trimmed = amountString.trim();
  if (trimmed === '') {
    return { value: null, isScalable: false };
  }

  // 3. Розбиваємо на пробільні токени.
  const tokens = trimmed.split(/\s+/);
  if (tokens.length === 0) {
    return { value: null, isScalable: false };
  }

  // 4. Беремо перший токен — це потенційне число/дріб.
  //    Якщо "2 dashes" → перший токен "2".
  //    Якщо "1 1/2" → перший токен "1", другий "1/2".
  const firstToken = tokens[0];
  const secondToken = tokens.length > 1 ? tokens[1] : null;

  // 5. Намагаємось розібрати перший токен як дробовий вираз.
  const firstParsed = parseNumberOrFraction(firstToken);

  // 6. Якщо перший токен — просте число (не дріб), перевіряємо другий на дріб.
  //    Це для змішаних чисел типу "1 1/2".
  if (firstParsed.isNumber && !firstParsed.isFraction && secondToken) {
    const secondParsed = parseNumberOrFraction(secondToken);
    if (secondParsed.isFraction && secondParsed.isNumber) {
      // 1 1/2 = 1 + 0.5 = 1.5
      const combined = firstParsed.value + secondParsed.value;
      return makeResult(combined);
    }
  }

  // 7. Якщо перший токен розібрався як число/дріб — повертаємо його.
  if (firstParsed.isNumber) {
    return makeResult(firstParsed.value);
  }

  // 8. Не вдалося розібрати — не масштабується.
  return { value: null, isScalable: false };
}

/* ============================================================
   Допоміжні функції (не експортуються).
   ============================================================ */

/**
 * Розбирає один токен як:
 *   - просте десяткове число (з крапкою чи комою)
 *   - простий дріб "a/b"
 *
 * @param {string} token
 * @returns {{isNumber: boolean, isFraction: boolean, value: number|null}}
 */
function parseNumberOrFraction(token) {
  if (!token) {
    return { isNumber: false, isFraction: false, value: null };
  }

  // Спробуємо як дріб "a/b".
  const slashIndex = token.indexOf('/');
  if (slashIndex > 0) {
    return parseFraction(token);
  }

  // Спробуємо як десяткове число (допускаємо крапку або кому).
  return parseDecimal(token);
}

/**
 * Парсить десяткове число: "30", "1.5", "1,5".
 */
function parseDecimal(token) {
  // Замінюємо кому на крапку для уніфікації.
  const normalized = token.replace(',', '.');

  // Перевірка: тільки цифри, крапка (одна), можливий знак мінус на початку.
  // Регекс: необов'язковий мінус, цифри, необов'язкова крапка + цифри.
  if (!/^-?\d+(\.\d+)?$/.test(normalized)) {
    return { isNumber: false, isFraction: false, value: null };
  }

  const value = Number(normalized);
  return makeParsedNumber(value, false);
}

/**
 * Парсить простий дріб: "1/2", "3/4".
 */
function parseFraction(token) {
  // Розділяємо по слешу.
  const parts = token.split('/');
  if (parts.length !== 2) {
    return { isNumber: false, isFraction: false, value: null };
  }

  const numeratorStr = parts[0];
  const denominatorStr = parts[1];

  // Чисельник і знаменник мають бути цілими числами (без дробів у них).
  if (!/^-?\d+$/.test(numeratorStr) || !/^-?\d+$/.test(denominatorStr)) {
    return { isNumber: false, isFraction: false, value: null };
  }

  const numerator = Number(numeratorStr);
  const denominator = Number(denominatorStr);

  // Знаменник не може бути нулем.
  if (denominator === 0) {
    return { isNumber: false, isFraction: false, value: null };
  }

  const value = numerator / denominator;
  return makeParsedNumber(value, true);
}

/**
 * Створює результат парсингу з перевіркою на NaN/Infinity.
 */
function makeParsedNumber(value, isFraction) {
  if (typeof value !== 'number' || Number.isNaN(value) || !Number.isFinite(value)) {
    return { isNumber: false, isFraction: false, value: null };
  }
  return { isNumber: true, isFraction, value };
}

/**
 * Створює фінальний результат { value, isScalable }.
 */
function makeResult(value) {
  if (typeof value !== 'number' || Number.isNaN(value) || !Number.isFinite(value)) {
    return { value: null, isScalable: false };
  }
  return { value, isScalable: true };
}

