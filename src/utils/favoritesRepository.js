import pb from "../lib/pocketbase";

export async function loadFavorites() {
  if (!pb.authStore.model) {
    return [];
  }
  try {
    const records = await pb.collection("favorites").getFullList({
      filter: `user = "${pb.authStore.model.id}"`,
      sort: "-created",
    });
    return records.map((r) => r.cocktail_id).filter(Boolean);
  } catch (err) {
    console.warn("BARLOG: не вдалося завантажити обране", err);
    return [];
  }
}

export async function addFavorite(cocktailId) {
  if (!pb.authStore.model) return;
  try {
    await pb.collection("favorites").create({
      user: pb.authStore.model.id,
      cocktail_id: cocktailId,
    });
  } catch (err) {
    const isUniqueViolation =
      err?.status === 400 &&
      (err?.response?.data?.user?.code === "validation_not_unique" ||
        err?.response?.data?.cocktail_id?.code === "validation_not_unique" ||
        err?.response?.data?.["user,cocktail_id"]?.code ===
          "validation_not_unique");

    if (isUniqueViolation) {
      return;
    }
    console.warn("BARLOG: не вдалося додати в обране", err);
  }
}

export async function removeFavorite(cocktailId) {
  if (!pb.authStore.model) return;
  try {
    const record = await pb
      .collection("favorites")
      .getFirstListItem(
        `user = "${pb.authStore.model.id}" && cocktail_id = "${cocktailId}"`,
      );
    await pb.collection("favorites").delete(record.id);
  } catch (err) {
    if (err?.status !== 404) {
      console.warn("BARLOG: не вдалося видалити з обраного", err);
    }
  }
}

/**
 * Миграция гостевых favorites при первом входе.
 * Сначала получает список существующих favorites с сервера,
 * затем создает только те, которых еще нет. Это избегает 400-ошибок
 * уникальности при попытке создать дубликаты.
 *
 * @param {string[]} cocktailIds
 * @returns {Promise<{ migrated: number, errors: number }>}
 */
export async function migrateGuestFavorites(cocktailIds) {
  if (
    !pb.authStore.model ||
    !Array.isArray(cocktailIds) ||
    cocktailIds.length === 0
  ) {
    return { migrated: 0, errors: 0 };
  }

  // 1. Получаем список уже существующих favorites пользователя с сервера
  let existingFavorites = [];
  try {
    const records = await pb.collection("favorites").getFullList({
      filter: `user = "${pb.authStore.model.id}"`,
      fields: "cocktail_id", // запрашиваем только нужное поле для экономии трафика
    });
    existingFavorites = records.map((r) => r.cocktail_id).filter(Boolean);
  } catch (err) {
    console.warn(
      "BARLOG: не вдалося завантажити існуючі обрані для міграції",
      err,
    );
    // Если не смогли загрузить — продолжаем как раньше (с риском 400, но перехватываем)
  }

  // 2. Определяем, какие коктейли реально нужно мигрировать (которых нет на сервере)
  const existingSet = new Set(existingFavorites);
  const toMigrate = cocktailIds.filter((id) => !existingSet.has(id));

  if (toMigrate.length === 0) {
    // Мигрировать нечего — все уже на сервере
    return { migrated: 0, errors: 0 };
  }

  // 3. Создаем только недостающие записи
  let migrated = 0;
  let errors = 0;

  for (const cocktailId of toMigrate) {
    try {
      await pb.collection("favorites").create({
        user: pb.authStore.model.id,
        cocktail_id: cocktailId,
      });
      migrated++;
    } catch (err) {
      // Страховка: если всё же пришла ошибка уникальности (гонка запросов) — пропускаем
      const isUniqueViolation =
        err?.status === 400 &&
        (err?.response?.data?.user?.code === "validation_not_unique" ||
          err?.response?.data?.cocktail_id?.code === "validation_not_unique" ||
          err?.response?.data?.["user,cocktail_id"]?.code ===
            "validation_not_unique");

      if (isUniqueViolation) {
        continue;
      }
      errors++;
      console.warn(
        `BARLOG: не вдалося мігрувати favorite "${cocktailId}"`,
        err,
      );
    }
  }

  return { migrated, errors };
}
