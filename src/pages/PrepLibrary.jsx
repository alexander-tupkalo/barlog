import "./PrepLibrary.css";
import { useState } from "react";
import EmptyState from "../components/ui/EmptyState";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Tag from "../components/ui/Tag";
import PrepDetails from "./PrepDetails";
import TechCard from "../components/lab/TechCard";
import useLanguage from "../hooks/useLanguage";
import { createPrepProduct } from "../utils/prepStorage";
import { wouldCreateCycle } from "../utils/prepCycleDetection";

const PREP_CATEGORIES = [
  { id: "syrup", labelKey: "prep.form.categorySyrup" },
  { id: "cordial", labelKey: "prep.form.categoryCordial" },
  { id: "infusion", labelKey: "prep.form.categoryInfusion" },
  { id: "juice", labelKey: "prep.form.categoryJuice" },
  { id: "mix", labelKey: "prep.form.categoryMix" },
  { id: "batch", labelKey: "prep.form.categoryBatch" },
  { id: "other", labelKey: "prep.form.categoryOther" },
];

const PREP_UNITS = [
  { id: "g", labelKey: "prep.form.unitG" },
  { id: "kg", labelKey: "prep.form.unitKg" },
  { id: "ml", labelKey: "prep.form.unitMl" },
  { id: "l", labelKey: "prep.form.unitL" },
  { id: "pcs", labelKey: "prep.form.unitPcs" },
  { id: "taste", labelKey: "prep.form.unitToTaste" },
];

function generateIngredientId() {
  const now = Date.now();
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return `prep-ing-${crypto.randomUUID()}`;
  }
  return `prep-ing-${now}-${Math.random().toString(36).slice(2, 8)}`;
}

function createEmptyIngredient() {
  return {
    id: generateIngredientId(),
    name: "",
    amount: "",
    unit: "ml",
    refType: "plain",
    refId: null,
  };
}

const EMPTY_FORM = {
  name: "",
  category: PREP_CATEGORIES[0].id,
  yieldAmount: "",
  yieldUnit: "ml",
  shelfLife: "",
  ingredients: [createEmptyIngredient()],
  method: "",
  notes: "",
};

function pluralizeIngredients(count, one, few, many) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}

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

function PlusIcon() {
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
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function MinusIcon() {
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
      className="preplibrary__row-icon"
    >
      <path d="M5 12h14" />
    </svg>
  );
}

function PrepLibrary({
  prepProducts,
  onSavePrepProduct,
  onArchivePrepProduct,
  onDeletePrepProduct,
}) {
  const { t } = useLanguage();
  const [mode, setMode] = useState("list");
  const [form, setForm] = useState(EMPTY_FORM);
  const [nameError, setNameError] = useState("");
  const [cycleError, setCycleError] = useState("");
  const [viewingProductId, setViewingProductId] = useState(null);
  const [editingProductId, setEditingProductId] = useState(null);
  const [filterMode, setFilterMode] = useState("active");
  const [isPrinting, setIsPrinting] = useState(false);

  const handleOpenForm = () => {
    setForm(EMPTY_FORM);
    setNameError("");
    setCycleError("");
    setEditingProductId(null);
    setMode("create");
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const handleOpenEdit = (product) => {
    const existingIngredients =
      Array.isArray(product.ingredients) && product.ingredients.length > 0
        ? product.ingredients.map((ing) => ({
            id: ing.id || generateIngredientId(),
            name: typeof ing.name === "string" ? ing.name : "",
            amount: typeof ing.amount === "string" ? ing.amount : "",
            unit: typeof ing.unit === "string" ? ing.unit : "ml",
            refType: ing.refType === "prep" ? "prep" : "plain",
            refId:
              ing.refType === "prep" && typeof ing.refId === "string"
                ? ing.refId
                : null,
          }))
        : [createEmptyIngredient()];

    setForm({
      name: product.name || "",
      category: product.category || PREP_CATEGORIES[0].id,
      yieldAmount: product.yieldAmount || "",
      yieldUnit: product.yieldUnit || "ml",
      shelfLife: product.shelfLife || "",
      ingredients: existingIngredients,
      method: product.method || "",
      notes: product.notes || "",
    });
    setNameError("");
    setCycleError("");
    setEditingProductId(product.id);
    setMode("edit");
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const handleCancelForm = () => {
    setForm(EMPTY_FORM);
    setNameError("");
    setCycleError("");
    setEditingProductId(null);
    if (viewingProductId) {
      setMode("details");
    } else {
      setMode("list");
    }
  };

  const handleOpenDetails = (productId) => {
    setViewingProductId(productId);
    setMode("details");
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const handleBackToList = () => {
    setViewingProductId(null);
    setMode("list");
  };

  const handleFieldChange = (field) => (event) => {
    const value = event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === "name" && nameError) setNameError("");
  };

  const handleAddIngredient = () => {
    setForm((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, createEmptyIngredient()],
    }));
    if (cycleError) setCycleError("");
  };

  const handleRemoveIngredient = (ingredientId) => {
    setForm((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((ing) => ing.id !== ingredientId),
    }));
    if (cycleError) setCycleError("");
  };

  const handleIngredientChange = (ingredientId, field, value) => {
    setForm((prev) => ({
      ...prev,
      ingredients: prev.ingredients.map((ing) => {
        if (ing.id !== ingredientId) return ing;
        const next = { ...ing, [field]: value };
        if (field === "refType") {
          if (value === "plain") {
            next.refId = null;
            next.name = next.name || "";
          } else if (value === "prep") {
            next.name = "";
            next.refId = next.refId || null;
          }
        }
        return next;
      }),
    }));
    if (cycleError) setCycleError("");
  };

  const handleIngredientPrepSelect = (ingredientId, selectedPrepId) => {
    setForm((prev) => ({
      ...prev,
      ingredients: prev.ingredients.map((ing) => {
        if (ing.id !== ingredientId) return ing;
        const selectedPrep = prepProducts.find((p) => p.id === selectedPrepId);
        return {
          ...ing,
          refType: "prep",
          refId: selectedPrepId,
          name: selectedPrep ? selectedPrep.name : "",
        };
      }),
    }));
    if (cycleError) setCycleError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmedName = form.name.trim();
    if (!trimmedName) {
      setNameError(t("prep.form.nameRequired"));
      return;
    }

    // Проверка циклических зависимостей перед сохранением.
    const targetId = mode === "edit" ? editingProductId : null;
    if (wouldCreateCycle(targetId, form.ingredients, prepProducts)) {
      setCycleError(t("prep.form.cycleError"));
      return;
    }
    setCycleError("");

    const cleanedIngredients = form.ingredients
      .filter((ing) => {
        if (ing.refType === "prep") {
          return Boolean(ing.refId);
        }
        return ing.name.trim().length > 0;
      })
      .map((ing) => {
        if (ing.refType === "prep") {
          const ref = prepProducts.find((p) => p.id === ing.refId);
          return {
            id: ing.id,
            name: ref ? ref.name : ing.name,
            amount: ing.amount.trim(),
            unit: ing.unit,
            refType: "prep",
            refId: ing.refId,
          };
        }
        return {
          id: ing.id,
          name: ing.name.trim(),
          amount: ing.amount.trim(),
          unit: ing.unit,
          refType: "plain",
          refId: null,
        };
      });

    const trimmedForm = {
      name: trimmedName,
      category: form.category,
      yieldAmount: form.yieldAmount.trim(),
      yieldUnit: form.yieldUnit,
      shelfLife: form.shelfLife.trim(),
      ingredients: cleanedIngredients,
      method: form.method.trim(),
      notes: form.notes.trim(),
    };

    if (mode === "edit" && editingProductId) {
      const existingProduct = prepProducts.find(
        (p) => p.id === editingProductId,
      );
      if (existingProduct) {
        const savedProduct = {
          ...existingProduct,
          ...trimmedForm,
          updatedAt: new Date().toISOString(),
        };
        onSavePrepProduct(savedProduct);
        setViewingProductId(editingProductId);
      }
    } else {
      const newProduct = createPrepProduct(trimmedForm);
      onSavePrepProduct(newProduct);
    }

    setForm(EMPTY_FORM);
    setNameError("");
    setCycleError("");
    setEditingProductId(null);
    setMode("details");
  };

  const handleArchiveFromDetails = (productId) => {
    onArchivePrepProduct(productId);
    setViewingProductId(null);
    setMode("list");
  };

  const handleDeleteFromDetails = (productId) => {
    onDeletePrepProduct(productId);
    setViewingProductId(null);
    setMode("list");
  };

  const handleRestoreFromDetails = (product) => {
    onSavePrepProduct({ ...product, isArchived: false });
  };

  const categoryLabel = (categoryId) => {
    const found = PREP_CATEGORIES.find((c) => c.id === categoryId);
    return found ? t(found.labelKey) : categoryId;
  };

  const viewingProduct = viewingProductId
    ? prepProducts.find((p) => p.id === viewingProductId)
    : null;

  if (viewingProductId && !viewingProduct) {
    setViewingProductId(null);
    setMode("list");
  }

  // --- РЕНДЕР ОВЕРЛЕЯ ДЛЯ ПЕЧАТИ ---
  if (isPrinting && viewingProduct) {
    return (
      <TechCard
        item={viewingProduct}
        type="prep"
        onClose={() => setIsPrinting(false)}
      />
    );
  }

  if (mode === "details" && viewingProduct) {
    return (
      <PrepDetails
        product={viewingProduct}
        prepProducts={prepProducts}
        onBack={handleBackToList}
        onEdit={handleOpenEdit}
        onArchive={handleArchiveFromDetails}
        onRestore={handleRestoreFromDetails}
        onDelete={handleDeleteFromDetails}
        onOpenProduct={handleOpenDetails}
        onPrint={() => setIsPrinting(true)}
      />
    );
  }

  if (mode === "create" || mode === "edit") {
    const isEditing = mode === "edit";
    const selectablePrepProducts = prepProducts.filter(
      (p) => !p.isArchived && p.id !== editingProductId,
    );

    return (
      <main className="preplibrary" aria-label={t("prep.title")}>
        <Button
          variant="secondary"
          className="preplibrary__back"
          onClick={handleCancelForm}
          aria-label={t("prep.backToList")}
        >
          <BackIcon />
          <span>{t("prep.form.backToList")}</span>
        </Button>

        <form className="preplibrary__form" onSubmit={handleSubmit} noValidate>
          <h2 className="preplibrary__form-title">
            {isEditing ? t("prep.form.editTitle") : t("prep.form.createTitle")}
          </h2>

          <fieldset className="preplibrary__section">
            <legend className="preplibrary__section-title">
              {t("prep.form.sectionBasic")}
            </legend>
            <Input
              label={t("prep.form.nameLabel")}
              placeholder={t("prep.form.namePlaceholder")}
              value={form.name}
              onChange={handleFieldChange("name")}
              error={nameError || undefined}
              required
              autoFocus
            />
            <div className="preplibrary__field-group">
              <label className="preplibrary__label" htmlFor="prep-category">
                {t("prep.form.categoryLabel")}
              </label>
              <select
                id="prep-category"
                className="preplibrary__select"
                value={form.category}
                onChange={handleFieldChange("category")}
              >
                {PREP_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {t(cat.labelKey)}
                  </option>
                ))}
              </select>
            </div>
          </fieldset>

          <fieldset className="preplibrary__section">
            <legend className="preplibrary__section-title">
              {t("prep.form.sectionDetails")}
            </legend>
            <div className="preplibrary__field-row">
              <Input
                label={t("prep.form.yieldAmountLabel")}
                placeholder={t("prep.form.yieldAmountPlaceholder")}
                value={form.yieldAmount}
                onChange={handleFieldChange("yieldAmount")}
              />
              <div className="preplibrary__field-group">
                <label className="preplibrary__label" htmlFor="prep-yield-unit">
                  {t("prep.form.yieldUnitLabel")}
                </label>
                <select
                  id="prep-yield-unit"
                  className="preplibrary__select"
                  value={form.yieldUnit}
                  onChange={handleFieldChange("yieldUnit")}
                >
                  {PREP_UNITS.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {t(unit.labelKey)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <Input
              label={t("prep.form.shelfLifeLabel")}
              placeholder={t("prep.form.shelfLifePlaceholder")}
              value={form.shelfLife}
              onChange={handleFieldChange("shelfLife")}
            />
          </fieldset>

          <fieldset className="preplibrary__section">
            <legend className="preplibrary__section-title">
              {t("prep.form.sectionIngredients")}
            </legend>
            <div className="preplibrary__ingredients">
              {form.ingredients.map((ing, index) => (
                <div key={ing.id} className="preplibrary__ingredient-row">
                  <div className="preplibrary__ingredient-index">
                    {index + 1}
                  </div>

                  <div
                    className="preplibrary__ingredient-type-toggle"
                    role="radiogroup"
                    aria-label={t("prep.form.ingredientTypeLabel")}
                  >
                    <label className="preplibrary__toggle-label">
                      <input
                        type="radio"
                        name={`type-${ing.id}`}
                        value="plain"
                        checked={ing.refType !== "prep"}
                        onChange={() =>
                          handleIngredientChange(ing.id, "refType", "plain")
                        }
                      />
                      {t("prep.form.ingredientTypePlain")}
                    </label>
                    <label className="preplibrary__toggle-label">
                      <input
                        type="radio"
                        name={`type-${ing.id}`}
                        value="prep"
                        checked={ing.refType === "prep"}
                        onChange={() =>
                          handleIngredientChange(ing.id, "refType", "prep")
                        }
                      />
                      {t("prep.form.ingredientTypePrep")}
                    </label>
                  </div>

                  {ing.refType === "prep" ? (
                    <select
                      className="preplibrary__select preplibrary__select--ingredient-name"
                      value={ing.refId || ""}
                      onChange={(e) =>
                        handleIngredientPrepSelect(ing.id, e.target.value)
                      }
                      aria-label={t("prep.form.selectPrepPlaceholder")}
                    >
                      <option value="" disabled>
                        {t("prep.form.selectPrepPlaceholder")}
                      </option>
                      {selectablePrepProducts.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      className="preplibrary__input preplibrary__input--ingredient-name"
                      placeholder={t("prep.form.ingredientNamePlaceholder")}
                      value={ing.name}
                      onChange={(e) =>
                        handleIngredientChange(ing.id, "name", e.target.value)
                      }
                      aria-label={t("prep.form.ingredientNameLabel")}
                    />
                  )}

                  <input
                    type="text"
                    className="preplibrary__input preplibrary__input--ingredient-amount"
                    placeholder={t("prep.form.ingredientAmountPlaceholder")}
                    value={ing.amount}
                    onChange={(e) =>
                      handleIngredientChange(ing.id, "amount", e.target.value)
                    }
                    aria-label={t("prep.form.ingredientAmountLabel")}
                  />
                  <select
                    className="preplibrary__select preplibrary__select--ingredient-unit"
                    value={ing.unit}
                    onChange={(e) =>
                      handleIngredientChange(ing.id, "unit", e.target.value)
                    }
                    aria-label={t("prep.form.ingredientUnitLabel")}
                  >
                    {PREP_UNITS.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {t(unit.labelKey)}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="preplibrary__row-action"
                    onClick={() => handleRemoveIngredient(ing.id)}
                    aria-label={t("prep.form.removeIngredient")}
                    disabled={form.ingredients.length === 1}
                  >
                    <MinusIcon />
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="preplibrary__add-row"
                onClick={handleAddIngredient}
              >
                <PlusIcon />
                <span>{t("prep.form.addIngredient")}</span>
              </button>
            </div>
          </fieldset>

          {/* Сообщение об ошибке циклической зависимости */}
          {cycleError && (
            <p className="preplibrary__form-error" role="alert">
              {cycleError}
            </p>
          )}

          <fieldset className="preplibrary__section">
            <legend className="preplibrary__section-title">
              {t("prep.form.sectionMethod")}
            </legend>
            <div className="preplibrary__field-group">
              <label className="preplibrary__label" htmlFor="prep-method">
                {t("prep.methodLabel")}
              </label>
              <textarea
                id="prep-method"
                className="preplibrary__textarea"
                placeholder={t("prep.form.methodPlaceholder")}
                value={form.method}
                onChange={handleFieldChange("method")}
                rows={3}
              />
            </div>
          </fieldset>

          <fieldset className="preplibrary__section">
            <legend className="preplibrary__section-title">
              {t("prep.form.sectionNotes")}
            </legend>
            <div className="preplibrary__field-group">
              <label className="preplibrary__label" htmlFor="prep-notes">
                {t("prep.notesLabel")}
              </label>
              <textarea
                id="prep-notes"
                className="preplibrary__textarea"
                placeholder={t("prep.form.notesPlaceholder")}
                value={form.notes}
                onChange={handleFieldChange("notes")}
                rows={3}
              />
            </div>
          </fieldset>

          <div className="preplibrary__form-actions">
            <Button type="submit" variant="primary">
              {t("prep.form.save")}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancelForm}
            >
              {t("prep.form.cancel")}
            </Button>
          </div>
        </form>
      </main>
    );
  }

  const filteredProducts = prepProducts.filter(
    (p) =>
      (filterMode === "active" && !p.isArchived) ||
      (filterMode === "archived" && p.isArchived),
  );
  const isEmpty = filteredProducts.length === 0;

  return (
    <main className="preplibrary" aria-label={t("prep.title")}>
      <header className="preplibrary__header">
        <p className="preplibrary__eyebrow">{t("prep.eyebrow")}</p>
        <h1 className="preplibrary__title">{t("prep.title")}</h1>
        <p className="preplibrary__intro">{t("prep.intro")}</p>
        {filterMode === "active" && !isEmpty && (
          <Button
            variant="primary"
            onClick={handleOpenForm}
            className="preplibrary__create"
          >
            {t("prep.form.create")}
          </Button>
        )}
      </header>

      <div
        className="preplibrary__filter"
        role="group"
        aria-label={t("prep.filterLabel")}
      >
        <button
          type="button"
          className={`preplibrary__filter-btn ${filterMode === "active" ? "preplibrary__filter-btn--active" : ""}`.trim()}
          aria-pressed={filterMode === "active"}
          onClick={() => setFilterMode("active")}
        >
          {t("prep.filterActive")}
        </button>
        <button
          type="button"
          className={`preplibrary__filter-btn ${filterMode === "archived" ? "preplibrary__filter-btn--active" : ""}`.trim()}
          aria-pressed={filterMode === "archived"}
          onClick={() => setFilterMode("archived")}
        >
          {t("prep.filterArchived")}
        </button>
      </div>

      {isEmpty ? (
        <EmptyState
          title={
            filterMode === "active"
              ? t("prep.emptyActiveTitle")
              : t("prep.emptyArchivedTitle")
          }
          description={
            filterMode === "active"
              ? t("prep.emptyActiveDescription")
              : t("prep.emptyArchivedDescription")
          }
          actionLabel={
            filterMode === "active" ? t("prep.form.create") : undefined
          }
          onAction={filterMode === "active" ? handleOpenForm : undefined}
        />
      ) : (
        <>
          <p className="preplibrary__count">
            {filteredProducts.length}{" "}
            {pluralizeIngredients(
              filteredProducts.length,
              t("prep.countSingular"),
              t("prep.countFew"),
              t("prep.countPlural"),
            )}
          </p>
          <ul className="preplibrary__list">
            {filteredProducts.map((product) => {
              const ingCount = Array.isArray(product.ingredients)
                ? product.ingredients.length
                : 0;
              return (
                <li key={product.id} className="preplibrary__card">
                  <button
                    type="button"
                    className="preplibrary__card-open"
                    onClick={() => handleOpenDetails(product.id)}
                    aria-label={`${t("prep.openDetails")} ${product.name}`}
                  />

                  <div className="preplibrary__card-content">
                    <div className="preplibrary__card-head">
                      <h3 className="preplibrary__card-name">{product.name}</h3>
                      <Tag>{categoryLabel(product.category)}</Tag>
                    </div>

                    <div className="preplibrary__card-details">
                      {product.yieldAmount && (
                        <p className="preplibrary__card-detail">
                          <span className="preplibrary__card-detail-label">
                            {t("prep.yieldLabel")}:
                          </span>{" "}
                          {product.yieldAmount}
                          {product.yieldUnit ? ` ${product.yieldUnit}` : ""}
                        </p>
                      )}
                      {product.shelfLife && (
                        <p className="preplibrary__card-detail">
                          <span className="preplibrary__card-detail-label">
                            {t("prep.shelfLifeLabel")}:
                          </span>{" "}
                          {product.shelfLife}
                        </p>
                      )}
                      <p className="preplibrary__card-detail">
                        <span className="preplibrary__card-detail-label">
                          {t("prep.ingredientsLabel")}:
                        </span>{" "}
                        {ingCount > 0
                          ? `${ingCount} ${pluralizeIngredients(
                              ingCount,
                              t("prep.ingredientSingular"),
                              t("prep.ingredientFew"),
                              t("prep.ingredientPlural"),
                            )}`
                          : t("prep.noIngredients")}
                      </p>
                    </div>

                    {product.isArchived && (
                      <p className="preplibrary__card-archived-badge">
                        {t("prep.archivedBadge")}
                      </p>
                    )}

                    <p className="preplibrary__card-meta">
                      {t("prep.sourceManual")} ·{" "}
                      {new Date(product.updatedAt).toLocaleDateString(
                        undefined,
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        },
                      )}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </main>
  );
}

export default PrepLibrary;