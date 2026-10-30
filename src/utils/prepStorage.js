/* ============================================================
   BARLOG — сховище препаратів (п/ф): сиропи, кордіали, інфузії,
   соки, мікси, батчі. Окрема сутність від коктейльних рецептів.

   Конвенція ключів: barlog-<feature>
     - barlog-prep-products — препарати
   ============================================================ */

export const PREP_STORAGE_KEY = 'barlog-prep-products';

/* ============================================================
   Генерація стабільних унікальних id.
   Використовуємо crypto.randomUUID() з безпечним фолбеком.
   ============================================================ */
function generateId(prefix = 'prep') {
  const now = Date.now();
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${now}-${Math.random().toString(36).slice(2, 8)}`;
}

/* ============================================================
   Допоміжні функції безпечної нормалізації.
   ============================================================ */

/**
 * Безпечно перетворює значення на рядок з дефолтом.
 */
function toString(value, defaultValue = '') {
  return typeof value === 'string' ? value.trim() : defaultValue;
}

/**
 * Повертає непорожній рядок або дефолт.
 */
function toNonEmptyString(value, defaultValue = '') {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value.trim();
  }
  return defaultValue;
}

/**
 * Безпечно нормалізує один інгредієнт препарату.
   Копіює у новий об'єкт — без мутацій вхідного.
 */
function normalizeIngredient(input) {
  const source = (input && typeof input === 'object') ? input : {};

  const rawRefType = source.refType;
  const isPrepRef = rawRefType === 'prep';

  return {
    id: toNonEmptyString(source.id, generateId('prep-ing')),
    name: toString(source.name, ''),
    // amount зберігаємо як рядок у первісному вигляді (без парсингу).
    amount: typeof source.amount === 'string' ? source.amount : '',
    unit: toString(source.unit, ''),
    // refType: 'prep' ТІЛЬКИ якщо явно 'prep', інакше 'plain'.
    refType: isPrepRef ? 'prep' : 'plain',
    // refId зберігаємо лише коли refType === 'prep'.
    refId: isPrepRef ? toNonEmptyString(source.refId, null) : null,
  };
}

/**
 * Нормалізує масив інгредієнтів.
   Завжди повертає новий масив з копіями об'єктів.
 */
function normalizeIngredients(input) {
  if (!Array.isArray(input)) return [];
  return input.map(normalizeIngredient);
}

/* ============================================================
   Створення нового об'єкта препарату з вхідних даних.
   Усі поля нормалізуються та копіюються.
 */
export function createPrepProduct(data = {}) {
  const source = (data && typeof data === 'object') ? data : {};

  const nowIso = new Date().toISOString();

  return {
    id: toNonEmptyString(source.id, generateId('prep')),
    name: toString(source.name, ''),
    // Категорія за замовчуванням — сироп.
    category: toNonEmptyString(source.category, 'syrup'),
    ingredients: normalizeIngredients(source.ingredients),
    method: toString(source.method, ''),
    // yieldAmount залишаємо як є (рядок): "500", "1 L", "0.5".
    // Парсинг/розрахунок — в окремій утиліті.
    yieldAmount: typeof source.yieldAmount === 'string'
      ? source.yieldAmount
      : '',
    yieldUnit: toString(source.yieldUnit, ''),
    shelfLife: toString(source.shelfLife, ''),
    notes: toString(source.notes, ''),
    isArchived: typeof source.isArchived === 'boolean' ? source.isArchived : false,
    createdAt: toNonEmptyString(source.createdAt, nowIso),
    updatedAt: toNonEmptyString(source.updatedAt, nowIso),
  };
}

/* ============================================================
   localStorage-операції.
   Усе звернення до window.localStorage — всередині try/catch.
   ============================================================ */

/**
 * Безпечно читає збережені препарати з localStorage.
   Повертає масив нормалізованих препаратів.
   Повертає [] у випадках:
     - localStorage недоступний (SSR, sandboxed iframe, приватний режим)
     - доступ до властивості кидає виняток
     - ключ відсутній (перший візит)
     - значення не є валідним JSON
     - розпарсене значення не є масивом
 */
export function loadPrepProducts() {
  if (typeof window === 'undefined') return [];
  try {
    const ls = window.localStorage;
    if (!ls) return [];
    const raw = ls.getItem(PREP_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((entry) => entry !== null && typeof entry === 'object')
      .map(createPrepProduct);
  } catch (error) {
    console.warn('BARLOG: не вдалося прочитати препарати з localStorage', error);
    return [];
  }
}

/**
 * Безпечно зберігає масив препаратів у localStorage.
   Нормалізує кожен елемент, серіалізує, записує.
   @returns {boolean} true при успіху, false при помилці.
 */
export function savePrepProducts(products) {
  if (typeof window === 'undefined') return false;
  try {
    const ls = window.localStorage;
    if (!ls) return false;

    if (!Array.isArray(products)) {
      return false;
    }

    const normalized = products
      .filter((p) => p !== null && typeof p === 'object')
      .map(createPrepProduct);

    ls.setItem(PREP_STORAGE_KEY, JSON.stringify(normalized));
    return true;
  } catch (error) {
    console.warn('BARLOG: не вдалося зберегти препарати в localStorage', error);
    return false;
  }
}

/**
 * Архівує препарат: позначає isArchived: true, оновлює updatedAt.
   Не видаляє фізично — лише м'яке видалення.
   Повертає новий масив (без мутації оригіналу).
   Якщо id не знайдено — повертає копію масиву без змін.
   Якщо вхід не масив — повертає [].
 */
export function archivePrepProduct(products, id) {
  if (!Array.isArray(products)) return [];

  const nowIso = new Date().toISOString();
  const targetId = typeof id === 'string' ? id : null;

  return products.map((product) => {
    if (
      product !== null &&
      typeof product === 'object' &&
      product.id === targetId
    ) {
      return createPrepProduct({
        ...product,
        isArchived: true,
        updatedAt: nowIso,
      });
    }
    // Копія незміненого продукту (нормалізуємо для одноманітності).
    return createPrepProduct(product);
  });
}


