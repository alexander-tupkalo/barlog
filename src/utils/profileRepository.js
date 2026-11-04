/* ============================================================
   BARLOG — репозиторий профиля бармена (PocketBase).
   Асинхронные операции с коллекцией `profiles`.

   Интерфейс:
     loadProfile() → Promise<{ displayName, role }>
     saveProfile(profile) → Promise<{ displayName, role }>
     migrateGuestProfile(guestProfile) → Promise<{ migrated: boolean }>

   Для гостей используется localStorage (см. Profile.jsx).
   ============================================================ */

import pb from '../lib/pocketbase';

const DEFAULT_PROFILE = {
  displayName: '',
  role: '',
};

/**
 * Загружает профиль текущего пользователя из PB.
 * Если профиль не найден — возвращает дефолт.
 *
 * @returns {Promise<{ displayName: string, role: string }>}
 */
export async function loadProfile() {
  if (!pb.authStore.model) {
    return { ...DEFAULT_PROFILE };
  }

  try {
    const profile = await pb
      .collection('profiles')
      .getFirstListItem(`user = "${pb.authStore.model.id}"`);

    return {
      displayName: profile.displayName || '',
      role: profile.role || '',
    };
  } catch (err) {
    // 404 — профиль не найден (например, миграция хука не сработала)
    if (err?.status === 404) {
      console.warn('BARLOG: профіль не знайдено, створюємо дефолтний');
      // Пытаемся создать пустой профиль
      try {
        await pb.collection('profiles').create({
          user: pb.authStore.model.id,
          displayName: '',
          role: '',
          ai_usage_count: 0,
        });
      } catch (createErr) {
        console.warn('BARLOG: не вдалося створити профіль', createErr);
      }
      return { ...DEFAULT_PROFILE };
    }
    console.warn('BARLOG: не вдалося завантажити профіль', err);
    return { ...DEFAULT_PROFILE };
  }
}

/**
 * Сохраняет профиль в PB (обновляет существующую запись).
 *
 * @param {{ displayName: string, role: string }} profile
 * @returns {Promise<{ displayName: string, role: string }>}
 */
export async function saveProfile(profile) {
  if (!pb.authStore.model) {
    throw new Error('Not authenticated');
  }

  try {
    // Находим существующий профиль
    const existing = await pb
      .collection('profiles')
      .getFirstListItem(`user = "${pb.authStore.model.id}"`);

    // Обновляем
    const updated = await pb.collection('profiles').update(existing.id, {
      displayName: profile.displayName || '',
      role: profile.role || '',
    });

    return {
      displayName: updated.displayName || '',
      role: updated.role || '',
    };
  } catch (err) {
    // Если профиля нет — создаём
    if (err?.status === 404) {
      const created = await pb.collection('profiles').create({
        user: pb.authStore.model.id,
        displayName: profile.displayName || '',
        role: profile.role || '',
        ai_usage_count: 0,
      });
      return {
        displayName: created.displayName || '',
        role: created.role || '',
      };
    }
    throw err;
  }
}

/**
 * Миграция гостевого профиля в PB при первом входе.
 * Если в PB профиль пустой, а в гостевом есть данные — обновляем.
 *
 * @param {{ displayName: string, role: string }} guestProfile
 * @returns {Promise<{ migrated: boolean }>}
 */
export async function migrateGuestProfile(guestProfile) {
  if (!pb.authStore.model || !guestProfile) {
    return { migrated: false };
  }

  // Если в гостевом профиле ничего нет — мигрировать нечего
  if (!guestProfile.displayName && !guestProfile.role) {
    return { migrated: false };
  }

  try {
    const existing = await pb
      .collection('profiles')
      .getFirstListItem(`user = "${pb.authStore.model.id}"`);

    // Если PB-профиль пустой, а в гостевом есть данные — обновляем
    if (!existing.displayName && !existing.role) {
      await pb.collection('profiles').update(existing.id, {
        displayName: guestProfile.displayName || '',
        role: guestProfile.role || '',
      });
      console.log('BARLOG: мігровано профіль бармена з гостя');
      return { migrated: true };
    }
  } catch (err) {
    console.warn('BARLOG: не вдалося мігрувати профіль', err);
  }

  return { migrated: false };
}