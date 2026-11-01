import {
  createContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { pb } from "../lib/pocketbase";

/* Контекст. undefined по умолчанию — чтобы хук useAuth отличал
   "вызов вне Provider" от "вызов внутри Provider" (когда user=null). */
const AuthContext = createContext(undefined);

/**
 * AuthProvider — постачальник контексту авторизації.
 *
 * Состояние:
 *   - user: { id, email, ... } | null — текущий пользователь (модель PB users)
 *   - loading: boolean — true во время первичной проверки сессии
 *   - error: string | null — текст последней ошибки (для UI)
 *
 * Действия:
 *   - signIn(email, password) — вход по email/паролю
 *   - signUp(email, password, name) — регистрация нового пользователя
 *   - signOut() — выход
 *   - signInWithOAuth(provider) — OAuth-вход (Google, Apple и т.д.)
 *   - clearError() — очистка ошибки (например, при закрытии модалки)
 *
 * Auth-токен автоматически сохраняется в localStorage под ключом
 * 'pocketbase_auth' — сам PB управляет этим. После F5 пользователь
 * остаётся залогинен.
 */
function AuthProvider({ children }) {
  // Инициализация: берём текущую модель из authStore, если PB уже валиден.
  // pb.authStore.model — это текущий пользователь (или null).
  const [user, setUser] = useState(() => pb.authStore.model);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ---------- Восстановление сессии при монтировании ---------- */
  useEffect(() => {
    // Флаг, чтобы игнорировать результаты отменённых запросов
    // (React StrictMode в dev монтирует компонент дважды, и первый
    // запрос отменяется вторым — это нормально, не ошибка).
    let cancelled = false;

    async function restoreSession() {
      try {
        if (pb.authStore.isValid) {
          await pb.collection("users").authRefresh();
          if (!cancelled) setUser(pb.authStore.model);
        }
      } catch (err) {
        // Тихо игнорируем отмену запроса (StrictMode autocancel).
        // Это не реальная ошибка авторизации.
        if (err?.isAbort || err?.name === "AbortError") {
          return;
        }
        console.warn("BARLOG: сесію не вдалося відновити", err);
        pb.authStore.clear();
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    restoreSession();

    const unsubscribe = pb.authStore.onChange((token, model) => {
      if (!cancelled) setUser(model);
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  /* ---------- Действия ---------- */

  const signIn = useCallback(async (email, password) => {
    setError(null);
    try {
      const authData = await pb
        .collection("users")
        .authWithPassword(email, password);
      setUser(authData.record);
      return { success: true };
    } catch (err) {
      const message = formatAuthError(err);
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  const signUp = useCallback(async (email, password, name) => {
    setError(null);
    try {
      // 1. Создаём запись в коллекции users
      const newUser = await pb.collection("users").create({
        email,
        password,
        passwordConfirm: password,
        name: name || "",
        // emailVisibility: false — email скрыт от других пользователей
      });

      // 2. Подтверждение email (опционально) — PocketBase может требовать
      // подтверждение. В dev-режиме отключите это в админке PB:
      // Settings → Auth → Email visibility → Verification
      // Для упрощения сейчас не требуем подтверждения.

      // 3. Сразу логиним пользователя после регистрации
      const authData = await pb
        .collection("users")
        .authWithPassword(email, password);
      setUser(authData.record);
      return { success: true };
    } catch (err) {
      const message = formatAuthError(err);
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  const signOut = useCallback(() => {
    pb.authStore.clear();
    setUser(null);
    setError(null);
  }, []);

  const signInWithOAuth = useCallback(async (provider) => {
    setError(null);
    try {
      // OAuth через popup. После успешного входа PB автоматически сохранит
      // токен в authStore и вызовет событие onChange (подписку выше).
      const authData = await pb.collection("users").authWithOAuth2({
        provider,
        url: pb.baseUrl,
      });
      setUser(authData.record);
      return { success: true };
    } catch (err) {
      const message = formatAuthError(err);
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /* ---------- Мемоизация значения контекста ---------- */
  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      isAuthed: Boolean(user),
      signIn,
      signUp,
      signOut,
      signInWithOAuth,
      clearError,
    }),
    [
      user,
      loading,
      error,
      signIn,
      signUp,
      signOut,
      signInWithOAuth,
      clearError,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext };
export default AuthProvider;

/* ============================================================
   Вспомогательная: формирует человеческое сообщение об ошибке
   из ответа PocketBase.
   ============================================================ */
function formatAuthError(err) {
  // Структура ошибки PB:
  // err.response.data — объект с полями, где ключи — это имена полей формы
  // err.response.message — общее сообщение
  // err.status — HTTP-статус

  if (!err.response) {
    // Сетевая ошибка / CORS / PB не запущен
    if (
      err.message?.includes("Failed to fetch") ||
      err.message?.includes("NetworkError")
    ) {
      return "Не вдалося з'єднатися з сервером. Перевір, чи запущений PocketBase.";
    }
    return err.message || "Невідома помилка";
  }

  const data = err.response.data || {};
  const status = err.status;

  // 400 — невалидные данные
  if (status === 400) {
    // Ошибки конкретных полей
    if (data.email) {
      return data.email.message || "Невалідний email";
    }
    if (data.password) {
      return data.password.message || "Невалідний пароль";
    }
    return "Невірні дані форми";
  }

  // 401 — неверный пароль
  if (status === 401) {
    return "Невірний email або пароль";
  }

  // 403 — доступ запрещён (например, email не подтверждён)
  if (status === 403) {
    return "Доступ заборонено. Можливо, email не підтверджено.";
  }

  // 429 — слишком много попыток
  if (status === 429) {
    return "Забагато спроб. Спробуй через хвилину.";
  }

  return err.response.message || "Помилка авторизації";
}
