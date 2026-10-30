import Button from '../ui/Button';
import Input from '../ui/Input';
import useLanguage from '../../hooks/useLanguage';
import {
  CATEGORIES,
  METHODS,
  GLASSWARE_OPTIONS,
  ICE_OPTIONS,
  UNITS,
} from '../../data/labOptions';

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
      focusable="false" className="mylab__icon">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
      focusable="false" className="mylab__row-icon">
      <path d="M5 12h14" />
    </svg>
  );
}

function AddRowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
      focusable="false" className="mylab__icon">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function ArrowUpIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
      focusable="false" className="mylab__row-icon">
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  );
}

function ArrowDownIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
      focusable="false" className="mylab__row-icon">
      <path d="M12 5v14M19 12l-7 7-7-7" />
    </svg>
  );
}

function RecipeForm({
  form,
  prepProducts,
  nameError,
  isEditing,
  onFieldChange,
  onServingsChange,
  onAddIngredient,
  onRemoveIngredient,
  onIngredientChange,
  onIngredientPrepSelect,
  onAddStep,
  onRemoveStep,
  onStepChange,
  onMoveStep,
  onSubmit,
  onCancel,
}) {
  const { t } = useLanguage();

  return (
    <main className="mylab" aria-label={t('lab.title')}>
      <Button
        variant="secondary"
        className="mylab__back"
        onClick={onCancel}
        aria-label={t('lab.form.backToList')}
      >
        <BackIcon />
        <span>{t('lab.form.backToList')}</span>
      </Button>

      <form className="mylab__form" onSubmit={onSubmit} noValidate>
        <h2 className="mylab__form-title">
          {isEditing ? t('lab.form.editTitle') : t('lab.form.createTitle')}
        </h2>

        <fieldset className="mylab__section">
          <legend className="mylab__section-title">
            {t('lab.form.sectionBasic')}
          </legend>
          <Input
            label={t('lab.form.nameLabel')}
            placeholder={t('lab.form.namePlaceholder')}
            value={form.name}
            onChange={onFieldChange('name')}
            error={nameError || undefined}
            required
            autoFocus
          />
          <div className="mylab__field-group">
            <label className="mylab__label" htmlFor="mylab-category">
              {t('lab.form.categoryLabel')}
            </label>
            <select
              id="mylab-category"
              className="mylab__select"
              value={form.category}
              onChange={onFieldChange('category')}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {t(cat.labelKey)}
                </option>
              ))}
            </select>
          </div>
          <Input
            label={t('lab.form.descriptionLabel')}
            placeholder={t('lab.form.descriptionPlaceholder')}
            value={form.description}
            onChange={onFieldChange('description')}
          />
          <div className="mylab__field-group">
            <label className="mylab__label" htmlFor="mylab-servings">
              {t('lab.form.servingsLabel')}
            </label>
            <input
              id="mylab-servings"
              type="number"
              min={1}
              step={1}
              className="mylab__input mylab__input--number"
              value={form.servings}
              onChange={onServingsChange}
            />
          </div>
        </fieldset>

        <fieldset className="mylab__section">
          <legend className="mylab__section-title">
            {t('lab.form.sectionIngredients')}
          </legend>
          <div className="mylab__ingredients">
            {form.ingredients.map((ing, index) => (
              <div key={ing.id} className="mylab__ingredient-row">
                <div className="mylab__ingredient-index">{index + 1}</div>

                {/* Переключатель типа ингредиента */}
                <div className="mylab__ingredient-type-toggle" role="radiogroup" aria-label={t('lab.form.ingredientTypeLabel')}>
                  <label className="mylab__toggle-label">
                    <input
                      type="radio"
                      name={`type-${ing.id}`}
                      value="plain"
                      checked={ing.refType !== 'prep'}
                      onChange={() => onIngredientChange(ing.id, 'refType', 'plain')}
                    />
                    {t('lab.form.ingredientTypePlain')}
                  </label>
                  <label className="mylab__toggle-label">
                    <input
                      type="radio"
                      name={`type-${ing.id}`}
                      value="prep"
                      checked={ing.refType === 'prep'}
                      onChange={() => onIngredientChange(ing.id, 'refType', 'prep')}
                    />
                    {t('lab.form.ingredientTypePrep')}
                  </label>
                </div>

                {/* Поле ввода в зависимости от типа */}
                {ing.refType === 'prep' ? (
                  <select
                    className="mylab__select mylab__select--ingredient-name"
                    value={ing.refId || ''}
                    onChange={(e) => onIngredientPrepSelect(ing.id, e.target.value)}
                    aria-label={t('lab.form.selectPrepPlaceholder')}
                  >
                    <option value="" disabled>
                      {t('lab.form.selectPrepPlaceholder')}
                    </option>
                    {prepProducts.filter(p => !p.isArchived).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    className="mylab__input mylab__input--ingredient-name"
                    placeholder={t('lab.form.ingredientNamePlaceholder')}
                    value={ing.name}
                    onChange={(e) => onIngredientChange(ing.id, 'name', e.target.value)}
                    aria-label={t('lab.form.ingredientNameLabel')}
                  />
                )}

                <input
                  type="text"
                  className="mylab__input mylab__input--ingredient-amount"
                  placeholder={t('lab.form.ingredientAmountPlaceholder')}
                  value={ing.amount}
                  onChange={(e) => onIngredientChange(ing.id, 'amount', e.target.value)}
                  aria-label={t('lab.form.ingredientAmountLabel')}
                />
                <select
                  className="mylab__select mylab__select--ingredient-unit"
                  value={ing.unit}
                  onChange={(e) => onIngredientChange(ing.id, 'unit', e.target.value)}
                  aria-label={t('lab.form.ingredientUnitLabel')}
                >
                  {UNITS.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {t(unit.labelKey)}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="mylab__row-action"
                  onClick={() => onRemoveIngredient(ing.id)}
                  aria-label={t('lab.form.removeIngredient')}
                  disabled={form.ingredients.length === 1}
                >
                  <MinusIcon />
                </button>
              </div>
            ))}
            <button
              type="button"
              className="mylab__add-row"
              onClick={onAddIngredient}
            >
              <AddRowIcon />
              <span>{t('lab.form.addIngredient')}</span>
            </button>
          </div>
        </fieldset>

        <fieldset className="mylab__section">
          <legend className="mylab__section-title">
            {t('lab.form.sectionPreparationDetails')}
          </legend>
          <div className="mylab__field-group">
            <label className="mylab__label" htmlFor="mylab-method">
              {t('lab.form.methodLabel')}
            </label>
            <select
              id="mylab-method"
              className="mylab__select"
              value={form.method}
              onChange={onFieldChange('method')}
            >
              {METHODS.map((m) => (
                <option key={m.id} value={m.id}>
                  {t(m.labelKey)}
                </option>
              ))}
            </select>
          </div>
          <div className="mylab__field-group">
            <label className="mylab__label" htmlFor="mylab-glassware">
              {t('lab.form.glasswareLabel')}
            </label>
            <select
              id="mylab-glassware"
              className="mylab__select"
              value={form.glassware}
              onChange={onFieldChange('glassware')}
            >
              {GLASSWARE_OPTIONS.map((g) => (
                <option key={g.id} value={g.id}>
                  {t(g.labelKey)}
                </option>
              ))}
            </select>
          </div>
          <div className="mylab__field-group">
            <label className="mylab__label" htmlFor="mylab-ice">
              {t('lab.form.iceLabel')}
            </label>
            <select
              id="mylab-ice"
              className="mylab__select"
              value={form.ice}
              onChange={onFieldChange('ice')}
            >
              {ICE_OPTIONS.map((i) => (
                <option key={i.id} value={i.id}>
                  {t(i.labelKey)}
                </option>
              ))}
            </select>
          </div>
          <Input
            label={t('lab.form.garnishLabel')}
            placeholder={t('lab.form.garnishPlaceholder')}
            value={form.garnish}
            onChange={onFieldChange('garnish')}
          />
        </fieldset>

        <fieldset className="mylab__section">
          <legend className="mylab__section-title">
            {t('lab.form.sectionSteps')}
          </legend>
          <div className="mylab__steps">
            {form.preparation.map((step, index) => (
              <div key={index} className="mylab__step-row">
                <span className="mylab__step-number">{index + 1}</span>
                <textarea
                  className="mylab__textarea mylab__textarea--step"
                  placeholder={t('lab.form.stepPlaceholder')}
                  value={step}
                  onChange={(e) => onStepChange(index, e.target.value)}
                  rows={2}
                  aria-label={t('lab.form.stepLabel').replace(
                    '{number}',
                    index + 1
                  )}
                />
                <div className="mylab__step-actions">
                  <button
                    type="button"
                    className="mylab__row-action"
                    onClick={() => onMoveStep(index, -1)}
                    aria-label={t('lab.form.moveStepUp')}
                    disabled={index === 0}
                  >
                    <ArrowUpIcon />
                  </button>
                  <button
                    type="button"
                    className="mylab__row-action"
                    onClick={() => onMoveStep(index, 1)}
                    aria-label={t('lab.form.moveStepDown')}
                    disabled={index === form.preparation.length - 1}
                  >
                    <ArrowDownIcon />
                  </button>
                  <button
                    type="button"
                    className="mylab__row-action"
                    onClick={() => onRemoveStep(index)}
                    aria-label={t('lab.form.removeStep')}
                    disabled={form.preparation.length === 1}
                  >
                    <MinusIcon />
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              className="mylab__add-row"
              onClick={onAddStep}
            >
              <AddRowIcon />
              <span>{t('lab.form.addStep')}</span>
            </button>
          </div>
        </fieldset>

        <fieldset className="mylab__section">
          <legend className="mylab__section-title">
            {t('lab.form.sectionNotes')}
          </legend>
          <div className="mylab__field-group">
            <label className="mylab__label" htmlFor="mylab-notes">
              {t('lab.form.notesLabel')}
            </label>
            <textarea
              id="mylab-notes"
              className="mylab__textarea"
              placeholder={t('lab.form.notesPlaceholder')}
              value={form.notes}
              onChange={onFieldChange('notes')}
              rows={3}
            />
          </div>
        </fieldset>

        <div className="mylab__form-actions">
          <Button type="submit" variant="primary">
            {t('lab.form.save')}
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel}>
            {t('lab.form.cancel')}
          </Button>
        </div>
      </form>
    </main>
  );
}

export default RecipeForm;