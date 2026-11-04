/* ============================================================
   BARLOG — репозиторий препаратов (PocketBase).
   Асинхронные операции с коллекциями `preps` и `prep_ingredients`.

   Интерфейс:
     loadPreps() → Promise<PrepProduct[]>
     savePrep(prep) → Promise<PrepProduct>
     deletePrep(prepId) → Promise<void>
     migrateGuestPreps(preps) → Promise<{ migrated, errors }>
   ============================================================ */

import pb from '../lib/pocketbase';

/* ============================================================
   Преобразование форматов
   ============================================================ */

function recordToPrep(record, ingredients = []) {
  if (!record) return null;
  return {
    id: record.id,
    name: record.name || '',
    category: record.category || 'syrup',
    ingredients: ingredients
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      .map((ing) => ({
        id: ing.id,
        name: ing.name || '',
        amount: ing.amount || '',
        unit: ing.unit || '',
        refType: ing.ref_type === 'prep' ? 'prep' : 'plain',
        refId: ing.ref_id || null,
      })),
    method: record.method || '',
    yieldAmount: record.yield_amount || '',
    yieldUnit: record.yield_unit || '',
    shelfLife: record.shelf_life || '',
    notes: record.notes || '',
    isArchived: Boolean(record.is_archived),
    createdAt: record.created ? new Date(record.created).toISOString() : new Date().toISOString(),
    updatedAt: record.updated ? new Date(record.updated).toISOString() : new Date().toISOString(),
  };
}

function prepToRecord(prep, userId) {
  return {
    user: userId,
    name: prep.name || '',
    category: prep.category || 'syrup',
    method: prep.method || '',
    yield_amount: prep.yieldAmount || '',
    yield_unit: prep.yieldUnit || '',
    shelf_life: prep.shelfLife || '',
    notes: prep.notes || '',
    is_archived: Boolean(prep.isArchived),
  };
}

/* ============================================================
   Загрузка
   ============================================================ */

export async function loadPreps() {
  if (!pb.authStore.model) return [];

  try {
    const preps = await pb.collection('preps').getFullList({
      filter: `user = "${pb.authStore.model.id}"`,
      sort: '-updated',
    });

    if (preps.length === 0) return [];

    const allIngredients = await pb.collection('prep_ingredients').getFullList({
      filter: `user = "${pb.authStore.model.id}"`,
    });

    const ingredientsByPrep = {};
    for (const ing of allIngredients) {
      const prepId = ing.prep;
      if (!ingredientsByPrep[prepId]) {
        ingredientsByPrep[prepId] = [];
      }
      ingredientsByPrep[prepId].push(ing);
    }

    return preps.map((p) => recordToPrep(p, ingredientsByPrep[p.id] || []));
  } catch (err) {
    console.warn('BARLOG: не вдалося завантажити препарати', err);
    return [];
  }
}

/* ============================================================
   Сохранение
   ============================================================ */

export async function savePrep(prep) {
  if (!pb.authStore.model) {
    throw new Error('Not authenticated');
  }

  const userId = pb.authStore.model.id;
  const record = prepToRecord(prep, userId);

  const isGuestId = !prep.id || prep.id.startsWith('prep-');

  let savedRecord;

  if (isGuestId) {
    savedRecord = await pb.collection('preps').create(record);
  } else {
    try {
      savedRecord = await pb.collection('preps').update(prep.id, record);
    } catch (err) {
      if (err?.status === 404) {
        savedRecord = await pb.collection('preps').create(record);
      } else {
        throw err;
      }
    }
  }

  await syncPrepIngredients(savedRecord.id, userId, prep.ingredients || []);

  const finalIngredients = await pb.collection('prep_ingredients').getFullList({
    filter: `prep = "${savedRecord.id}" && user = "${userId}"`,
  });

  return recordToPrep(savedRecord, finalIngredients);
}

async function syncPrepIngredients(prepId, userId, ingredients) {
  try {
    const existing = await pb.collection('prep_ingredients').getFullList({
      filter: `prep = "${prepId}"`,
      fields: 'id',
    });
    for (const ing of existing) {
      await pb.collection('prep_ingredients').delete(ing.id);
    }
  } catch (err) {
    console.warn('BARLOG: не вдалося видалити старі інгредієнти препарату', err);
  }

  for (let i = 0; i < ingredients.length; i++) {
    const ing = ingredients[i];
    try {
      await pb.collection('prep_ingredients').create({
        prep: prepId,
        user: userId,
        name: ing.name || '',
        amount: ing.amount || '',
        unit: ing.unit || '',
        ref_type: ing.refType === 'prep' ? 'prep' : 'plain',
        ref_id: ing.refId || '',
        sort_order: i,
      });
    } catch (err) {
      console.warn(`BARLOG: не вдалося створити інгредієнт препарату "${ing.name}"`, err);
    }
  }
}

/* ============================================================
   Удаление
   ============================================================ */

export async function deletePrep(prepId) {
  if (!pb.authStore.model) return;
  try {
    await pb.collection('preps').delete(prepId);
  } catch (err) {
    if (err?.status !== 404) {
      console.warn('BARLOG: не вдалося видалити препарат', err);
    }
  }
}

/* ============================================================
   Миграция гостевых препаратов
   ============================================================ */

export async function migrateGuestPreps(preps) {
  if (!pb.authStore.model || !Array.isArray(preps) || preps.length === 0) {
    return { migrated: 0, errors: 0 };
  }

  let migrated = 0;
  let errors = 0;

  for (const prep of preps) {
    try {
      const { id, ...prepData } = prep;
      await savePrep(prepData);
      migrated++;
    } catch (err) {
      errors++;
      console.warn(`BARLOG: не вдалося мігрувати препарат "${prep.name}"`, err);
    }
  }

  return { migrated, errors };
}