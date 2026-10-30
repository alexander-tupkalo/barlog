import { useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';

/**
 * useLanguage — хук для доступу до контексту мови.
 *
 * @returns {{ language: string, setLanguage: Function, t: Function }}
 *   - language: поточна мова ('uk' або 'ru')
 *   - setLanguage: Function — встановлює нову мову
 *   - t: Function — функція перекладу, приймає ключ типу 'nav.home'
 *
 * @throws {Error} якщо викликано поза <LanguageProvider>
 */
function useLanguage() {
  const context = useContext(LanguageContext);

  if (context === undefined) {
    throw new Error(
      'useLanguage повинен викликатися всередині <LanguageProvider>. ' +
        'Переконайтеся, що компонент обгорнуто провайдером.'
    );
  }

  return context;
}

export default useLanguage;