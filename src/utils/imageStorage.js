/* ============================================================
   BARLOG — IndexedDB-сховище зображень для рецептів My Lab.
   Зберігаємо Blob під стабільним ключем, читаємо при рендерингу,
   відкликаємо object URL після використання.

   Конвенція ключа: 'lab-img-<recipeId>' — один рецепт, одне фото.
   Це дозволяє безпечно видаляти попереднє фото при заміні,
   оскільки ключ жорстко прив'язаний до recipe.id.

   Реалізуємо без адаптерів і залежностей — нативний IndexedDB.
   ============================================================ */

const DB_NAME = 'barlog-images';
const DB_VERSION = 1;
const STORE_NAME = 'images';

let dbPromise = null;

/**
 * Відкриваємо IndexedDB і створюємо object store за потреби.
   Лінива ініціалізація — викликається лише при першому доступі.
   Зберігаємо Promise, щоб паралельні виклики не намагались
   відкрити БД двічі (IndexedDB не терпить одночасних open).
 */
function openDb() {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    // Перевірка доступності IndexedDB (sandboxed iframes, приватний режим).
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB unavailable in this environment'));
      return;
    }

    let request;
    try {
      request = indexedDB.open(DB_NAME, DB_VERSION);
    } catch (err) {
      reject(err);
      return;
    }

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      // Створюємо store тільки якщо його ще немає (перший запуск).
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = () => {
      reject(request.error || new Error('Failed to open IndexedDB'));
    };
  });

  // При помилці — скидаємо promise, щоб наступний виклик міг спробувати знову.
  dbPromise.catch(() => {
    dbPromise = null;
  });

  return dbPromise;
}

/**
 * Зберігає Blob у IndexedDB під вказаним ключем.
 *
 * @param {string} key — стабільний ключ (напр. 'lab-img-<recipeId>')
 * @param {Blob} blob — бінарні дані зображення
 * @returns {Promise<void>} — resolve при успіху, reject при помилці.
 */
export function saveImage(key, blob) {
  if (typeof key !== 'string' || !key) {
    return Promise.reject(new Error('Invalid storage key'));
  }
  if (!(blob instanceof Blob)) {
    return Promise.reject(new Error('Invalid blob'));
  }

  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.put(blob, key);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
        tx.onerror = () => reject(tx.error);
      })
  );
}

/**
 * Читає Blob з IndexedDB за ключем.
 *
 * @param {string} key
 * @returns {Promise<Blob|null>} — Blob при наявності, null якщо ключа немає.
   null (не reject) — щоб caller міг легко зробити fallback на плейсхолдер.
 */
export function loadImage(key) {
  if (typeof key !== 'string' || !key) {
    return Promise.resolve(null);
  }

  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.get(key);

        request.onsuccess = () => {
          const result = request.result;
          // Якщо ключа немає — result буде undefined.
          resolve(result instanceof Blob ? result : null);
        };
        request.onerror = () => reject(request.error);
      })
  );
}

/**
 * Видаляє Blob за ключем. Безпечно для відсутнього ключа.
 *
 * @param {string} key
 * @returns {Promise<void>}
 */
export function deleteImage(key) {
  if (typeof key !== 'string' || !key) {
    return Promise.resolve();
  }

  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.delete(key);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      })
  );
}

/**
 * Перевіряє, чи доступне сховище IndexedDB у поточному середовищі.
   Використовується для приховання UI завантаження фото, якщо IndexedDB
   недоступний (старий браузер, sandboxed iframe без дозволу).
 *
 * @returns {boolean}
 */
export function isImageStorageAvailable() {
  return typeof indexedDB !== 'undefined';
}