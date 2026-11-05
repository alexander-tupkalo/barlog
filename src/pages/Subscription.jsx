import "./Subscription.css";
import Button from "../components/ui/Button";
import PlanCard from "../components/subscription/PlanCard";
import SubscriptionBadge from "../components/subscription/SubscriptionBadge";
import useLanguage from "../hooks/useLanguage";
import useSubscription from "../hooks/useSubscription";

function BackIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className="subscription__back-icon"
    >
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

/**
 * Subscription — сторінка планів підписки BARLOG Free / Pro.
 *
 * На сторінці дві картки планів. Користувач може «обрати» Pro — це
 * демо-переключення плану через useSubscription (localStorage).
 * Реальна оплата не виконується.
 */
function Subscription({ onNavigate }) {
  const { t } = useLanguage();
  const { plan, upgrade, downgrade } = useSubscription();

  const freeFeatures = [
    { text: t("subscription.free.feature1"), included: true },
    { text: t("subscription.free.feature2"), included: true },
    { text: t("subscription.free.feature3"), included: true },
    { text: t("subscription.free.feature4"), included: true },
    { text: t("subscription.free.feature5"), included: true },
    { text: t("subscription.free.feature6"), included: true },
    { text: t("subscription.pro.feature1"), included: false },
    { text: t("subscription.pro.feature2"), included: false },
    { text: t("subscription.pro.feature3"), included: false },
    { text: t("subscription.pro.feature4"), included: false },
    { text: t("subscription.pro.feature5"), included: false },
  ];

  const proFeatures = [
    { text: t("subscription.free.feature1"), included: true },
    { text: t("subscription.free.feature2"), included: true },
    { text: t("subscription.free.feature3"), included: true },
    { text: t("subscription.free.feature4"), included: true },
    { text: t("subscription.free.feature5"), included: true },
    { text: t("subscription.free.feature6"), included: true },
    { text: t("subscription.pro.feature1"), included: true },
    { text: t("subscription.pro.feature2"), included: true },
    { text: t("subscription.pro.feature3"), included: true },
    { text: t("subscription.pro.feature4"), included: true },
    { text: t("subscription.pro.feature5"), included: true },
  ];

  return (
    <main className="subscription">
      <header className="subscription__header">
        <Button
          variant="secondary"
          className="subscription__back"
          onClick={() => onNavigate("profile")}
          aria-label={t("subscription.backToProfile")}
        >
          <BackIcon />
          <span>{t("subscription.backToProfile")}</span>
        </Button>

        <div className="subscription__heading">
          <p className="subscription__eyebrow">{t("subscription.eyebrow")}</p>
          <h1 className="subscription__title">{t("subscription.title")}</h1>
          <p className="subscription__intro">{t("subscription.intro")}</p>

          <div className="subscription__current">
            <span className="subscription__current-label">
              {t("subscription.currentPlanLabel")}:
            </span>
            <SubscriptionBadge plan={plan} size="md" />
          </div>
        </div>
      </header>

      <div className="subscription__plans">
        <PlanCard
          plan="free"
          title={t("subscription.free.title")}
          price="$0"
          period={t("subscription.free.period")}
          description={t("subscription.free.description")}
          features={freeFeatures}
          isCurrent={plan === "free"}
          onAction={downgrade}
          actionLabel={t("subscription.action.chooseFree")}
          footerNote={t("subscription.free.footerNote")}
        />

        <PlanCard
          plan="pro"
          title={t("subscription.pro.title")}
          price="$9"
          period={t("subscription.pro.period")}
          description={t("subscription.pro.description")}
          features={proFeatures}
          isCurrent={plan === "pro"}
          isHighlighted
          onAction={upgrade}
          actionLabel={t("subscription.action.choosePro")}
          footerNote={t("subscription.pro.footerNote")}
        />
      </div>

      <p className="subscription__demo-notice">
        {t("subscription.demoNotice")}
      </p>
    </main>
  );
}

export default Subscription;
