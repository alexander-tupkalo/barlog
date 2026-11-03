/* ============================================================
   BARLOG — репозиторий рецептов (PocketBase).
   Асинхронные операции с коллекциями `recipes` и `recipe_ingredients`.
   Поддержка загрузки изображений в PB file storage.
   ============================================================ */

import pb from "../lib/pocketbase";
import { loadImage } from "./imageStorage";

/* ============================================================
   Преобразование форматов
   ============================================================ */

/**
 * PB record → формат Recipe BARLOG.
 * Принимает рецепт и массив его ингредиентов.
 *
 * ВАЖНО: Для PB-записей поле `image` заполняется объектом с `url`
 * (PB file URL), чтобы существующие хелперы (getRecipeImageUrl)
 * работали без изменений. `storageKey` = null (нет IndexedDB).
 */
function recordToRecipe(record, ingredients = []) {
  if (!record) return null;
  const imageUrl = record.image ? pb.files.getURL(record, record.image) : null;

  return {
    id: record.id,
    name: record.name || "",
    category: record.category || "other",
    description: record.description || "",
    servings: record.servings || 1,
    ingredients: ingredients
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      .map((ing) => ({
        id: ing.id,
        name: ing.name || "",
        amount: ing.amount || "",
        unit: ing.unit || "",
        refType: ing.ref_type === "prep" ? "prep" : "plain",
        refId: ing.ref_id || null,
      })),
    method: record.method || "",
    glassware: record.glassware || "",
    ice: record.ice || "",
    garnish: record.garnish || "",
    steps: Array.isArray(record.steps) ? record.steps : [],
    notes: record.notes || "",
    // Поле image — совместимо со старым форматом (image.url, image.storageKey)
    image: {
      url: imageUrl,
      status: record.image ? "uploaded" : "empty",
      updatedAt: record.updated
        ? new Date(record.updated).getTime()
        : Date.now(),
      storageKey: null, // Для PB-записей IndexedDB не используется
    },
    // Дублируем для удобства прямого доступа в компонентах
    imageUrl,
    imageId: record.image || null,
    createdAt: record.created
      ? new Date(record.created).getTime()
      : Date.now(),
    updatedAt: record.updated
      ? new Date(record.updated).getTime()
      : Date.now(),
  };
}

function recipeToRecord(recipe, userId) {
  return {
    user: userId,
    name: recipe.name || "",
    category: recipe.category || "other",
    description: recipe.description || "",
    servings: typeof recipe.servings === "number" ? recipe.servings : 1,
    method: recipe.method || "",
    glassware: recipe.glassware || "",
    ice: recipe.ice || "",
    garnish: recipe.garnish || "",
    steps: Array.isArray(recipe.steps) ? recipe.steps : [],
    notes: recipe.notes || "",
  };
}

/* ============================================================
   Загрузка
   ============================================================ */

export async function loadRecipes() {
  if (!pb.authStore.model) return [];

  try {
    const recipes = await pb.collection("recipes").getFullList({
      filter: `user = "${pb.authStore.model.id}"`,
      sort: "-updated",
    });

    if (recipes.length === 0) return [];

    const allIngredients = await pb
      .collection("recipe_ingredients")
      .getFullList({
        filter: `user = "${pb.authStore.model.id}"`,
      });

    const ingredientsByRecipe = {};
    for (const ing of allIngredients) {
      const recipeId = ing.recipe;
      if (!ingredientsByRecipe[recipeId]) {
        ingredientsByRecipe[recipeId] = [];
      }
      ingredientsByRecipe[recipeId].push(ing);
    }

    return recipes.map((r) =>
      recordToRecipe(r, ingredientsByRecipe[r.id] || [])
    );
  } catch (err) {
    console.warn("BARLOG: не вдалося завантажити рецепти", err);
    return [];
  }
}

/* ============================================================
   Сохранение
   ============================================================ */

export async function saveRecipe(recipe) {
  if (!pb.authStore.model) {
    throw new Error("Not authenticated");
  }

  const userId = pb.authStore.model.id;
  const record = recipeToRecord(recipe, userId);

  const isGuestId = !recipe.id || recipe.id.startsWith("recipe-");

  let savedRecord;

  if (isGuestId) {
    savedRecord = await pb.collection("recipes").create(record);
  } else {
    try {
      savedRecord = await pb.collection("recipes").update(recipe.id, record);
    } catch (err) {
      if (err?.status === 404) {
        savedRecord = await pb.collection("recipes").create(record);
      } else {
        throw err;
      }
    }
  }

  await syncIngredients(savedRecord.id, userId, recipe.ingredients || []);

  const finalIngredients = await pb
    .collection("recipe_ingredients")
    .getFullList({
      filter: `recipe = "${savedRecord.id}" && user = "${userId}"`,
    });

  return recordToRecipe(savedRecord, finalIngredients);
}

async function syncIngredients(recipeId, userId, ingredients) {
  try {
    const existing = await pb.collection("recipe_ingredients").getFullList({
      filter: `recipe = "${recipeId}"`,
      fields: "id",
    });
    for (const ing of existing) {
      await pb.collection("recipe_ingredients").delete(ing.id);
    }
  } catch (err) {
    console.warn("BARLOG: не вдалося видалити старі інгредієнти", err);
  }

  for (let i = 0; i < ingredients.length; i++) {
    const ing = ingredients[i];
    try {
      await pb.collection("recipe_ingredients").create({
        recipe: recipeId,
        user: userId,
        name: ing.name || "",
        amount: ing.amount || "",
        unit: ing.unit || "",
        ref_type: ing.refType === "prep" ? "prep" : "plain",
        ref_id: ing.refId || "",
        sort_order: i,
      });
    } catch (err) {
      console.warn(`BARLOG: не вдалося створити інгредієнт "${ing.name}"`, err);
    }
  }
}

/* ============================================================
   Удаление
   ============================================================ */

export async function deleteRecipe(recipeId) {
  if (!pb.authStore.model) return;
  try {
    await pb.collection("recipes").delete(recipeId);
  } catch (err) {
    if (err?.status !== 404) {
      console.warn("BARLOG: не вдалося видалити рецепт", err);
    }
  }
}

/* ============================================================
   Изображения
   ============================================================ */

/**
 * Загружает изображение рецепта в PB file storage.
 * Заменяет IndexedDB из старой архитектуры.
 *
 * @param {string} recipeId
 * @param {File|Blob} file
 * @returns {Promise<string>} URL загруженного изображения
 */
export async function uploadRecipeImage(recipeId, file) {
  if (!pb.authStore.model) {
    throw new Error("Not authenticated");
  }

  const formData = new FormData();

  // Санитизируем имя файла: только латиница, цифры, дефис, точка
  const originalName = file.name || "image.jpg";
  const sanitized = originalName
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]/g, "-") // всё не-латиницу → дефис
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  const safeName = sanitized || `image-${Date.now()}.jpg`;

  formData.append("image", file, safeName);

  try {
    const updated = await pb.collection("recipes").update(recipeId, formData);
    const imageUrl = pb.files.getURL(updated, updated.image);
    return imageUrl;
  } catch (err) {
    console.error("BARLOG: uploadRecipeImage details:", {
      status: err?.status,
      message: err?.message,
      responseData: err?.response?.data,
      recipeId,
      safeName,
      fileType: file.type,
      fileSize: file.size,
    });
    throw err;
  }
}

/**
 * Удаляет изображение рецепта из PB.
 * Передаёт пустое значение в поле image — PB очистит файл.
 *
 * @param {string} recipeId
 */
export async function deleteRecipeImage(recipeId) {
  if (!pb.authStore.model) return;
  try {
    await pb.collection("recipes").update(recipeId, {
      image: null,
    });
  } catch (err) {
    if (err?.status !== 404) {
      console.warn("BARLOG: не вдалося видалити фото рецепта", err);
    }
  }
}

/* ============================================================
   Миграция гостевых рецептов + изображений
   ============================================================ */

/**
 * Миграция гостевых рецептов при первом входе.
 * Создаёт рецепты в PB, сохраняет ингредиенты.
 * Если у рецепта было изображение в IndexedDB — загружает его в PB.
 *
 * @param {Recipe[]} recipes
 * @returns {Promise<{ migrated: number, errors: number, imagesMigrated: number }>}
 */
export async function migrateGuestRecipes(recipes) {
  if (!pb.authStore.model || !Array.isArray(recipes) || recipes.length === 0) {
    return { migrated: 0, errors: 0, imagesMigrated: 0 };
  }

  let migrated = 0;
  let errors = 0;
  let imagesMigrated = 0;

  for (const recipe of recipes) {
    try {
      const { id, image, ...recipeData } = recipe;
      const saved = await saveRecipe(recipeData);
      migrated++;

      // Миграция изображения, если есть
      if (image?.storageKey) {
        try {
          const blob = await loadImage(image.storageKey);
          if (blob) {
            await uploadRecipeImage(saved.id, blob);
            imagesMigrated++;
          }
        } catch (imgErr) {
          console.warn(
            `BARLOG: не вдалося мігрувати фото для рецепта "${recipe.name}"`,
            imgErr
          );
        }
      }
    } catch (err) {
      errors++;
      console.warn(`BARLOG: не вдалося мігрувати рецепт "${recipe.name}"`, err);
    }
  }

  return { migrated, errors, imagesMigrated };
}