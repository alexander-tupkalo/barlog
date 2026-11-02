import { useState, useEffect, useCallback, useMemo } from "react";
import { pb } from "../lib/pocketbase";
import useAuth from "./useAuth";
import {
  loadSubscription,
  saveSubscription,
  SUBSCRIPTION_PLANS,
} from "../utils/subscriptionStorage";

function useSubscription() {
  const { user } = useAuth();
  // Гость всегда Free, залогиненный — начнём с Free, обновим с сервера
  const [plan, setPlanState] = useState(SUBSCRIPTION_PLANS.FREE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadServerSubscription() {
      if (!user) {
        // Гость всегда Free (независимо от localStorage)
        setPlanState(SUBSCRIPTION_PLANS.FREE);
        setLoading(false);
        return;
      }

      // Залогиненный → PocketBase
      try {
        const subscription = await pb
          .collection("subscriptions")
          .getFirstListItem(`user = "${user.id}"`);

        if (cancelled) return;
        setPlanState(subscription.plan || SUBSCRIPTION_PLANS.FREE);

        // Realtime: подписываемся на изменения конкретной записи по ID.
        // PocketBase SDK возвращает Promise, отписка — через unsubscribe(topic, callback?).
        pb.collection("subscriptions").subscribe(subscription.id, (e) => {
          if (cancelled) return;
          if (e.record) {
            setPlanState(e.record.plan || SUBSCRIPTION_PLANS.FREE);
          }
        });
      } catch (err) {
        if (!cancelled) {
          console.warn("BARLOG: не вдалося завантажити підписку", err);
          setPlanState(SUBSCRIPTION_PLANS.FREE);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadServerSubscription();

    // Слушаем localStorage для гостя (между вкладками)
    function handleStorageChange(event) {
      if (event.key === "barlog-subscription" && !user) {
        setPlanState(loadSubscription());
      }
    }
    window.addEventListener("storage", handleStorageChange);

    return () => {
      cancelled = true;
      window.removeEventListener("storage", handleStorageChange);
      // Отписываемся от realtime — PocketBase SDK позволяет вызвать без аргументов
      // для отписки от всех подписок этой коллекции.
      pb.collection("subscriptions").unsubscribe();
    };
  }, [user]);

  /**
   * Локально меняет план — ТОЛЬКО для гостей (демо-режим).
   * Залогиненным пользователям менять подписку через эту функцию нельзя —
   * это делает только Stripe webhook на сервере.
   */
  /**
   * Локально меняет план — ТОЛЬКО для гостей (демо-режим).
   * Залогиненным менять через эту функцию нельзя —
   * подписка меняется только через Stripe webhook на сервере.
   * Для залогиненного — это no-op (ничего не делает).
   */
  const setPlan = useCallback(
    (nextPlan) => {
      if (user) {
        console.warn(
          "BARLOG: нельзя локально сменить план залогиненному пользователю",
        );
        return;
      }
      saveSubscription(nextPlan);
      setPlanState(nextPlan);
    },
    [user],
  );

  const upgrade = useCallback(() => {
    setPlan(SUBSCRIPTION_PLANS.PRO);
  }, [setPlan]);

  const downgrade = useCallback(() => {
    setPlan(SUBSCRIPTION_PLANS.FREE);
  }, [setPlan]);

  const isPro = plan === SUBSCRIPTION_PLANS.PRO;

  return useMemo(
    () => ({ plan, isPro, loading, upgrade, downgrade, setPlan }),
    [plan, isPro, loading, upgrade, downgrade, setPlan],
  );
}

export default useSubscription;
