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
        setPlanState(SUBSCRIPTION_PLANS.FREE);
        setLoading(false);
        return;
      }

      try {
        const subscription = await pb
          .collection("subscriptions")
          .getFirstListItem(`user = "${user.id}"`);

        if (cancelled) return;
        setPlanState(subscription.plan || SUBSCRIPTION_PLANS.FREE);

        pb.collection("subscriptions").subscribe(subscription.id, (e) => {
          if (cancelled) return;
          if (e.record) {
            setPlanState(e.record.plan || SUBSCRIPTION_PLANS.FREE);
          }
        });
      } catch (err) {
        if (cancelled) return;
        if (err?.isAbort || err?.name === "AbortError") {
          return;
        }
        console.warn("BARLOG: не вдалося завантажити підписку", err);
        setPlanState(SUBSCRIPTION_PLANS.FREE);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadServerSubscription();

    function handleStorageChange(event) {
      if (event.key === "barlog-subscription" && !user) {
        setPlanState(SUBSCRIPTION_PLANS.FREE);
      }
    }
    window.addEventListener("storage", handleStorageChange);

    return () => {
      cancelled = true;
      window.removeEventListener("storage", handleStorageChange);
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
