/* ============================================================
   BARLOG — инициализация PocketBase-клиента.
   Единственное место во всём фронтенде, где создаётся PB-инстанс.
   Все остальные модули импорруют `pb` отсюда.
   ============================================================ */

import PocketBase from 'pocketbase';

// VITE_PB_URL берётся из .env.local:
//   VITE_PB_URL=http://127.0.0.1:8090
// На проде (Fly.io) будет:
//   VITE_PB_URL=https://api.barlog.app
const pbUrl = import.meta.env.VITE_PB_URL || 'http://127.0.0.1:8090';

// Создаём singleton-инстанс PB-клиента.
// Auth-токен автоматически сохраняется в localStorage браузера
// под ключом 'pocketbase_auth' — PB сам управляет этим.
export const pb = new PocketBase(pbUrl);

// В development-режиме полезно видеть PB-логи в консоли.
if (import.meta.env.DEV) {
  pb.autoCancellation = false; // чтобы не блокировать параллельные запросы
}

export default pb;