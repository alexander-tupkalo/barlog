import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  loadSubscription,
  saveSubscription,
  SUBSCRIPTION_PLANS,
} from '../utils/subscriptionStorage';

/**
 * useSubscription — єдинне джерело правди про підписку користувача.
 *
 * Синхронізується між вкладками через подію 'barlog:subscription-change'
 * (диспатчиться у saveSubscription) та 'storage' (нативна міжвкладкова
 * синхронізація localStorage).
 *
 * Повертає:
 *   - plan: 'free' | 'pro'
 *   - isPro: boolean
 *   - upgrade(): переводить на Pro
 *   - downgrade(): повертає на Free
 *   - setPlan(plan): встановлює довільний валідний план
 *
 * У майбутньому, коли AuthContext буде готовий, цей хук можна розширити
 * синхронізацією з сервером — поки що працює локально.
 */
function useSubscription() {
  const [plan, setPlanState] = useState(loadSubscription);

  // Слухаємо зміни підписки від saveSubscription (CustomEvent).
  useEffect(() => {
    function handleLocalChange(event) {
      const nextPlan = event?.detail?.plan;
      if (nextPlan) setPlanState(nextPlan);
    }
    window.addEventListener(
      'barlog:subscription-change',
      handleLocalChange
    );
    return () => {
      window.removeEventListener(
        'barlog:subscription-change',
        handleLocalChange
      );
    };
  }, []);

  // Слухаємо зміни від інших вкладок (нативна подія storage).
  useEffect(() => {
    function handleStorageChange(event) {
      if (event.key === 'barlog-subscription') {
        setPlanState(loadSubscription());
      }
    }
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const setPlan = useCallback((nextPlan) => {
    saveSubscription(nextPlan);
    // Оптимістичне оновлення — CustomEvent спрацює, але це пришвидшить UI.
    setPlanState(nextPlan);
  }, []);

  const upgrade = useCallback(() => {
    setPlan(SUBSCRIPTION_PLANS.PRO);
  }, [setPlan]);

  const downgrade = useCallback(() => {
    setPlan(SUBSCRIPTION_PLANS.FREE);
  }, [setPlan]);

  const isPro = plan === SUBSCRIPTION_PLANS.PRO;

  return useMemo(
    () => ({ plan, isPro, upgrade, downgrade, setPlan }),
    [plan, isPro, upgrade, downgrade, setPlan]
  );
}

export default useSubscription;