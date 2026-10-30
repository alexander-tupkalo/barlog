import "./PrepLibrary.css";
import Button from "../components/ui/Button";
import Tag from "../components/ui/Tag";
import useLanguage from "../hooks/useLanguage";

const PREP_CATEGORIES = [
  { id: "syrup", labelKey: "prep.form.categorySyrup" },
  { id: "cordial", labelKey: "prep.form.categoryCordial" },
  { id: "infusion", labelKey: "prep.form.categoryInfusion" },
  { id: "juice", labelKey: "prep.form.categoryJuice" },
  { id: "mix", labelKey: "prep.form.categoryMix" },
  { id: "batch", labelKey: "prep.form.categoryBatch" },
  { id: "other", labelKey: "prep.form.categoryOther" },
];

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
      className="preplibrary__icon"
    >
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

function EditIcon() {
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
      className="preplibrary__icon-action"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function ArchiveIcon() {
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
      className="preplibrary__icon-action"
    >
      <rect x="2" y="3" width="20" height="5" rx="1" />
      <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
      <line x1="10" y1="12" x2="14" y2="12" />
    </svg>
  );
}

function RestoreIcon() {
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
      className="preplibrary__icon-action"
    >
      <path d="M3 12a9 9 0 1 0 9-9" />
      <path d="M3 4v5h5" />
    </svg>
  );
}

function TrashIcon() {
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
      className="preplibrary__icon-action"
    >
      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

function PrintIcon() {
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
      className="preplibrary__icon-action"
    >
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  );
}

function PrepDetails({
  product,
  prepProducts,
  onBack,
  onEdit,
  onArchive,
  onRestore,
  onDelete,
  onOpenProduct,
  onPrint,
}) {
  const { t } = useLanguage();

  if (!product) {
    return (
      <main className="preplibrary" aria-label={t("prep.title")}>
        <Button
          variant="secondary"
          className="preplibrary__back"
          onClick={onBack}
          aria-label={t("prep.backToList")}
        >
          <BackIcon />
          <span>{t("prep.backToList")}</span>
        </Button>
        <p className="preplibrary__not-found">{t("prep.notFound")}</p>
      </main>
    );
  }

  const categoryLabel = (categoryId) => {
    const found = PREP_CATEGORIES.find((c) => c.id === categoryId);
    return found ? t(found.labelKey) : categoryId;
  };

  const hasYield = Boolean(product.yieldAmount);
  const hasShelfLife = Boolean(product.shelfLife);
  const hasIngredients =
    Array.isArray(product.ingredients) && product.ingredients.length > 0;
  const hasMethod = Boolean(product.method);
  const hasNotes = Boolean(product.notes);
  const isArchived = Boolean(product.isArchived);

  const handleArchiveClick = () => {
    const message = t("prep.confirmArchive").replace("{name}", product.name);
    if (window.confirm(message)) {
      onArchive(product.id);
    }
  };

  const handleRestoreClick = () => {
    const message = t("prep.confirmRestore").replace("{name}", product.name);
    if (window.confirm(message)) {
      onRestore({ ...product, isArchived: false });
    }
  };

  const handleDeleteClick = () => {
    const message = t("prep.confirmDelete").replace("{name}", product.name);
    if (window.confirm(message)) {
      onDelete(product.id);
    }
  };

  // Рендер одного ингредиента с поддержкой ссылок на п/ф.
  const renderIngredient = (ing, index) => {
    if (ing.refType === "prep" && ing.refId) {
      const refProduct = prepProducts.find((p) => p.id === ing.refId);

      if (!refProduct) {
        // Ссылка не найдена (удалена).
        return (
          <li
            key={ing.id || index}
            className="preplibrary__details-ingredient preplibrary__details-ingredient--ref"
          >
            <div className="preplibrary__details-ingredient-info">
              <span className="preplibrary__details-ingredient-name">
                {ing.name || t("prep.prepRefMissing")}
              </span>
              <Tag variant="muted">{t("prep.prepRefMissingTag")}</Tag>
            </div>
            <span className="preplibrary__details-ingredient-amount">
              {ing.amount}
              {ing.unit ? ` ${ing.unit}` : ""}
            </span>
          </li>
        );
      }

      // Ссылка найдена (возможно, архивирована).
      return (
        <li
          key={ing.id || index}
          className="preplibrary__details-ingredient preplibrary__details-ingredient--ref"
        >
          <div className="preplibrary__details-ingredient-info">
            <button
              type="button"
              className="preplibrary__ref-link"
              onClick={() => onOpenProduct(refProduct.id)}
            >
              {refProduct.name}
            </button>
            {refProduct.isArchived ? (
              <Tag variant="muted">{t("prep.prepRefArchivedTag")}</Tag>
            ) : (
              <Tag variant="accent">{t("prep.prepRefTag")}</Tag>
            )}
          </div>
          <span className="preplibrary__details-ingredient-amount">
            {ing.amount}
            {ing.unit ? ` ${ing.unit}` : ""}
          </span>
        </li>
      );
    }

    // Обычный текстовый ингредиент.
    return (
      <li key={ing.id || index} className="preplibrary__details-ingredient">
        <span className="preplibrary__details-ingredient-name">{ing.name}</span>
        <span className="preplibrary__details-ingredient-amount">
          {ing.amount}
          {ing.unit ? ` ${ing.unit}` : ""}
        </span>
      </li>
    );
  };

  return (
    <main className="preplibrary" aria-label={product.name}>
      <Button
        variant="secondary"
        className="preplibrary__back"
        onClick={onBack}
        aria-label={t("prep.backToList")}
      >
        <BackIcon />
        <span>{t("prep.backToList")}</span>
      </Button>

      <header className="preplibrary__details-header">
        <p className="preplibrary__eyebrow">
          {categoryLabel(product.category)}
        </p>
        <h1 className="preplibrary__details-title">{product.name}</h1>
        {isArchived && (
          <span className="preplibrary__details-archived-badge">
            {t("prep.archivedBadge")}
          </span>
        )}
      </header>

      <div className="preplibrary__details-actions">
        {/* Добавлена кнопка печати */}
        {onPrint && (
          <Button
            variant="secondary"
            onClick={onPrint}
            className="preplibrary__action-btn"
          >
            <PrintIcon />
            <span>{t("techcard.printButton")}</span>
          </Button>
        )}
        {!isArchived && (
          <Button
            variant="primary"
            onClick={() => onEdit(product)}
            className="preplibrary__action-btn"
          >
            <EditIcon />
            <span>{t("prep.form.edit")}</span>
          </Button>
        )}
        {isArchived ? (
          <>
            <Button
              variant="primary"
              onClick={handleRestoreClick}
              className="preplibrary__action-btn"
            >
              <RestoreIcon />
              <span>{t("prep.restoreAction")}</span>
            </Button>
            <Button
              variant="secondary"
              onClick={handleDeleteClick}
              className="preplibrary__action-btn"
            >
              <TrashIcon />
              <span>{t("prep.deleteAction")}</span>
            </Button>
          </>
        ) : (
          <Button
            variant="secondary"
            onClick={handleArchiveClick}
            className="preplibrary__action-btn"
          >
            <ArchiveIcon />
            <span>{t("prep.archiveAction")}</span>
          </Button>
        )}
      </div>

      <dl className="preplibrary__details-meta">
        {hasYield && (
          <div className="preplibrary__details-meta-item">
            <dt className="preplibrary__details-meta-label">
              {t("prep.yieldLabel")}
            </dt>
            <dd className="preplibrary__details-meta-value">
              {product.yieldAmount}
              {product.yieldUnit ? ` ${product.yieldUnit}` : ""}
            </dd>
          </div>
        )}
        {hasShelfLife && (
          <div className="preplibrary__details-meta-item">
            <dt className="preplibrary__details-meta-label">
              {t("prep.shelfLifeLabel")}
            </dt>
            <dd className="preplibrary__details-meta-value">
              {product.shelfLife}
            </dd>
          </div>
        )}
        <div className="preplibrary__details-meta-item">
          <dt className="preplibrary__details-meta-label">
            {t("prep.ingredientsLabel")}
          </dt>
          <dd className="preplibrary__details-meta-value">
            {hasIngredients
              ? `${product.ingredients.length}`
              : t("prep.noIngredients")}
          </dd>
        </div>
        <div className="preplibrary__details-meta-item">
          <dt className="preplibrary__details-meta-label">
            {t("prep.categoryLabel")}
          </dt>
          <dd className="preplibrary__details-meta-value">
            <Tag>{categoryLabel(product.category)}</Tag>
          </dd>
        </div>
      </dl>

      {hasIngredients && (
        <section className="preplibrary__details-section">
          <h2 className="preplibrary__details-section-title">
            {t("prep.ingredientsLabel")}
          </h2>
          <ul className="preplibrary__details-ingredients">
            {product.ingredients.map(renderIngredient)}
          </ul>
        </section>
      )}

      {hasMethod && (
        <section className="preplibrary__details-section">
          <h2 className="preplibrary__details-section-title">
            {t("prep.methodLabel")}
          </h2>
          <p className="preplibrary__details-text">{product.method}</p>
        </section>
      )}

      {hasNotes && (
        <section className="preplibrary__details-section">
          <h2 className="preplibrary__details-section-title">
            {t("prep.notesLabel")}
          </h2>
          <p className="preplibrary__details-text">{product.notes}</p>
        </section>
      )}

      <p className="preplibrary__details-meta-footer">
        {t("prep.sourceManual")}
        {" · "}
        {new Date(product.updatedAt).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </p>
    </main>
  );
}

export default PrepDetails;