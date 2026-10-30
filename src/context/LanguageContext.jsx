import { createContext, useState, useCallback, useMemo } from 'react';
import {
  translations,
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
} from '../i18n/translations';

/* Ключ під яким мова зберігається в localStorage. */
const STORAGE_KEY = 'barlog-language';

/* Сам контекст. За замовчуванням має значення undefined — це дозволяє
   хуку useLanguage відрізнити "виклик поза Provider" від "виклик у Provider". */
const LanguageContext = createContext(undefined);

/**
 * Безпечно читає мову з localStorage.
 * Повертає лише 'uk' або 'ru'. Якщо значення відсутнє або некоректне —
 * повертає DEFAULT_LANGUAGE ('uk').
 *
 * !!! Функція викликається всередині useState initializer, тобто
 * під час першого рендеру компонента — НЕ на рівні модуля.
 * Це дозволяє уникнути помилок під час SSR або тестуванні з моками localStorage.
 */
function readStoredLanguage() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return DEFAULT_LANGUAGE;
  }
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED_LANGUAGES.includes(stored)) {
      return stored;
    }
  } catch (error) {
    // localStorage може бути недоступним (приватний режим, заборонені cookie тощо).
    // У такому випадку просто повертаємо дефолт — це безпечно.
    console.warn('BARLOG: не вдалося прочитати мову з localStorage', error);
  }
  return DEFAULT_LANGUAGE;
}

/**
 * LanguageProvider — постачальник контексту мови.
 *
 * @param {React.ReactNode} children — вміст, який отримає доступ до контексту
 *
 * Значення контексту:
 * @property {('uk'|'ru')} language — поточна мова
 * @property {Function} setLanguage — встановлює нову мову ('uk' або 'ru')
 * @property {Function} t — функція перекладу: t('nav.home') → 'Головна' або 'Главная'
 */
function LanguageProvider({ children }) {
  // useState initializer викликається один раз під час першого рендеру.
  // Це безпечніше, ніж викликати readStoredLanguage() на рівні модуля.
  const [language, setLanguageState] = useState(readStoredLanguage);

  /**
   * Встановлює нову мову. Приймає лише 'uk' або 'ru'.
   * Інші значення ігноруються з попередженням у консолі.
   * Також зберігає вибір у localStorage для наступних візитів.
   */
  const setLanguage = useCallback((nextLanguage) => {
    if (!SUPPORTED_LANGUAGES.includes(nextLanguage)) {
      console.warn(
        `BARLOG: спроба встановити непідтримувану мову "${nextLanguage}". Використовується ${DEFAULT_LANGUAGE}.`
      );
      return;
    }
    setLanguageState(nextLanguage);

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(STORAGE_KEY, nextLanguage);
      } catch (error) {
        // Не критично — сесія продовжиться з мовою в пам'яті.
        console.warn('BARLOG: не вдалося зберегти мову в localStorage', error);
      }
    }
  }, []);

  /**
   * Функція перекладу.
   * Приймає ключ у точковій нотації: 'nav.home', 'home.cta', 'empty.libraryTitle'.
   *
   * Стратегія fallback:
   *   1. Шукаємо ключ у словнику поточної мови.
   *   2. Якщо не знайдено — шукаємо в українському словнику (як запасний).
   *   3. Якщо немає і там — повертаємо сам ключ як рядок.
   *
   * Це гарантує, що додаток ніколи не впаде через відсутній переклад.
   */
  const t = useCallback(
    (key) => {
      const lookup = (dict, path) => {
        const parts = path.split('.');
        let current = dict;
        for (const part of parts) {
          if (current && typeof current === 'object' && part in current) {
            current = current[part];
          } else {
            return undefined;
          }
        }
        return typeof current === 'string' ? current : undefined;
      };

      // 1. Поточна мова
      const primary = lookup(translations[language], key);
      if (primary !== undefined) return primary;

      // 2. Український fallback
      if (language !== DEFAULT_LANGUAGE) {
        const fallback = lookup(translations[DEFAULT_LANGUAGE], key);
        if (fallback !== undefined) return fallback;
      }

      // 3. Ключ як останній запас — не падаємо
      return key;
    },
    [language]
  );

  /* Мемоізуємо значення контексту, щоб уникнути зайвих ре-рендерів,
     коли language не змінився. */
  const value = useMemo(
    () => ({ language, setLanguage, t }),
    [language, setLanguage, t]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export { LanguageContext };
export default LanguageProvider;