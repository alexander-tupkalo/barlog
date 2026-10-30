/* ============================================================
   BARLOG — чисті хелпери для рецептів My Lab.
   Не залежать від React — легко тестуються.
   ============================================================ */

import {
  CATEGORIES,
  METHODS,
  GLASSWARE_OPTIONS,
  ICE_OPTIONS,
  UNITS,
} from '../data/labOptions';

/* ============================================================
   Генерація стабільних унікальних id.
   Використовуємо crypto.randomUUID() з безпечним фолбеком.
   ============================================================ */
export function generateId(prefix = 'row') {
  const now = Date.now();
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${now}-${Math.random().toString(36).slice(2, 8)}`;
}

export function generateRecipeId() {
  const now = Date.now();
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `recipe-${now}-${Math.random().toString(36).slice(2, 8)}`;
}

/* ============================================================
   Створення порожніх елементів.
   ============================================================ */
export function createEmptyIngredient() {
  return {
    id: generateId('ing'),
    name: '',
    amount: '',
    unit: UNITS[0].id,
    refType: 'plain',
    refId: null,
  };
}

export function createEmptyStep() {
  return '';
}

export function createEmptyImage() {
  return { url: null, status: 'empty', updatedAt: null, storageKey: null };
}

export function createEmptyForm() {
  return {
    name: '',
    category: CATEGORIES[0].id,
    description: '',
    servings: 1,
    ingredients: [createEmptyIngredient()],
    method: METHODS[0].id,
    glassware: GLASSWARE_OPTIONS[0].id,
    ice: ICE_OPTIONS[0].id,
    garnish: '',
    preparation: [createEmptyStep()],
    notes: '',
    image: createEmptyImage(),
  };
}

/* ============================================================
   Завантаження форми з існуючого рецепту (для редагування).
   Зберігаємо id, createdAt, image — без змін.
   Заповнюємо всі поля форми, включаючи інгредієнти й кроки.
   Якщо рецепту бракує якихось полів (старі дані) — використовуємо defaults.
   ============================================================ */
export function loadFormFromRecipe(recipe) {
  if (!recipe) return createEmptyForm();

  const ingredients = Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0
    ? recipe.ingredients.map((ing) => ({
        id: ing.id || generateId('ing'),
        name: typeof ing.name === 'string' ? ing.name : '',
        amount: typeof ing.amount === 'string' ? ing.amount : '',
        unit: typeof ing.unit === 'string' ? ing.unit : UNITS[0].id,
        refType: ing.refType === 'prep' ? 'prep' : 'plain',
        refId: ing.refType === 'prep' && typeof ing.refId === 'string' ? ing.refId : null,
      }))
    : [createEmptyIngredient()];

  const preparation = Array.isArray(recipe.preparation) && recipe.preparation.length > 0
    ? recipe.preparation.map((step) => (typeof step === 'string' ? step : ''))
    : [createEmptyStep()];

  return {
    name: typeof recipe.name === 'string' ? recipe.name : '',
    category: typeof recipe.category === 'string' ? recipe.category : CATEGORIES[0].id,
    description: typeof recipe.description === 'string' ? recipe.description : '',
    servings: typeof recipe.servings === 'number' && recipe.servings > 0 ? recipe.servings : 1,
    ingredients,
    method: typeof recipe.method === 'string' ? recipe.method : METHODS[0].id,
    glassware: typeof recipe.glassware === 'string' ? recipe.glassware : GLASSWARE_OPTIONS[0].id,
    ice: typeof recipe.ice === 'string' ? recipe.ice : ICE_OPTIONS[0].id,
    garnish: typeof recipe.garnish === 'string' ? recipe.garnish : '',
    preparation,
    notes: typeof recipe.notes === 'string' ? recipe.notes : '',
    image: recipe.image || createEmptyImage(),
  };
}

/* ============================================================
   Хелпер: безпечно витягнути url зображення з рецепту.
   ============================================================ */
export function getRecipeImageUrl(recipe) {
  if (!recipe) return null;
  if (typeof recipe.image === 'object' && recipe.image !== null) {
    return typeof recipe.image.url === 'string' && recipe.image.url.length > 0
      ? recipe.image.url
      : null;
  }
  if (typeof recipe.image === 'string' && recipe.image.length > 0) {
    return recipe.image;
  }
  return null;
}