import Button from '../ui/Button';
import Tag from '../ui/Tag';
import useLanguage from '../../hooks/useLanguage';
import RecipeImageManager from './RecipeImageManager';
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

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
      focusable="false" className="mylab__icon-action">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
      focusable="false" className="mylab__icon-action">
      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

function PrintIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
      focusable="false" className="mylab__icon-action">
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  );
}

function RecipeDetails({ recipe, prepProducts, imageProps, onBack, onEdit, onDelete, onOpenPrep, onPrint }) {
  const { t } = useLanguage();

  const categoryLabel = (categoryId) => {
    const found = CATEGORIES.find((c) => c.id === categoryId);
    return found ? t(found.labelKey) : categoryId;
  };

  const methodLabel = (methodId) => {
    const found = METHODS.find((m) => m.id === methodId);
    return found ? t(found.labelKey) : methodId;
  };

  const glasswareLabel = (glasswareId) => {
    const found = GLASSWARE_OPTIONS.find((g) => g.id === glasswareId);
    return found ? t(found.labelKey) : glasswareId;
  };

  const iceLabel = (iceId) => {
    const found = ICE_OPTIONS.find((i) => i.id === iceId);
    return found ? t(found.labelKey) : iceId;
  };

  const unitLabel = (unitId) => {
    const found = UNITS.find((u) => u.id === unitId);
    return found ? t(found.labelKey) : unitId;
  };

  const renderIngredient = (ing, index) => {
    if (ing.refType === 'prep' && ing.refId) {
      const refProduct = prepProducts.find((p) => p.id === ing.refId);
      if (!refProduct) {
        return (
          <li key={ing.id || index} className="mylab__details-ingredient mylab__details-ingredient--ref">
            <div className="mylab__details-ingredient-info">
              <span className="mylab__details-ingredient-name">
                {ing.name || t('lab.prepRefMissing')}
              </span>
              <Tag variant="muted">{t('lab.prepRefMissingTag')}</Tag>
            </div>
            <span className="mylab__details-ingredient-amount">
              {ing.amount}
              {ing.unit ? ` ${unitLabel(ing.unit)}` : ''}
            </span>
          </li>
        );
      }
      return (
        <li key={ing.id || index} className="mylab__details-ingredient mylab__details-ingredient--ref">
          <div className="mylab__details-ingredient-info">
            <button
              type="button"
              className="mylab__ref-link"
              onClick={onOpenPrep}
            >
              {refProduct.name}
            </button>
            {refProduct.isArchived ? (
              <Tag variant="muted">{t('lab.prepRefArchivedTag')}</Tag>
            ) : (
              <Tag variant="accent">{t('lab.prepRefTag')}</Tag>
            )}
          </div>
          <span className="mylab__details-ingredient-amount">
            {ing.amount}
            {ing.unit ? ` ${unitLabel(ing.unit)}` : ''}
          </span>
        </li>
      );
    }
    return (
      <li key={ing.id || index} className="mylab__details-ingredient">
        <span className="mylab__details-ingredient-name">{ing.name}</span>
        <span className="mylab__details-ingredient-amount">
          {ing.amount}
          {ing.unit ? ` ${unitLabel(ing.unit)}` : ''}
        </span>
      </li>
    );
  };

  return (
    <main className="mylab mylab--details" aria-label={recipe.name}>
      <Button
        variant="secondary"
        className="mylab__back"
        onClick={onBack}
        aria-label={t('lab.form.backToList')}
      >
        <BackIcon />
        <span>{t('lab.form.backToList')}</span>
      </Button>

      <RecipeImageManager recipe={recipe} {...imageProps} />

      <header className="mylab__details-header">
        <p className="mylab__eyebrow">{categoryLabel(recipe.category)}</p>
        <h1 className="mylab__details-title">{recipe.name}</h1>
        {recipe.description && (
          <p className="mylab__details-description">{recipe.description}</p>
        )}
      </header>

      <div className="mylab__details-actions">
        {/* Добавлена кнопка печати */}
        <Button variant="secondary" onClick={onPrint} className="mylab__action-btn">
          <PrintIcon />
          <span>{t('techcard.printButton')}</span>
        </Button>
        <Button variant="primary" onClick={onEdit} className="mylab__action-btn">
          <EditIcon />
          <span>{t('lab.form.edit')}</span>
        </Button>
        <Button
          variant="secondary"
          onClick={onDelete}
          aria-label={`${t('lab.form.delete')} ${recipe.name}`}
          className="mylab__action-btn"
        >
          <TrashIcon />
          <span>{t('lab.form.delete')}</span>
        </Button>
      </div>

      <dl className="mylab__details-meta">
        <div className="mylab__details-meta-item">
          <dt className="mylab__details-meta-label">{t('lab.form.methodLabel')}</dt>
          <dd className="mylab__details-meta-value">{methodLabel(recipe.method)}</dd>
        </div>
        <div className="mylab__details-meta-item">
          <dt className="mylab__details-meta-label">{t('lab.form.glasswareLabel')}</dt>
          <dd className="mylab__details-meta-value">{glasswareLabel(recipe.glassware)}</dd>
        </div>
        <div className="mylab__details-meta-item">
          <dt className="mylab__details-meta-label">{t('lab.form.iceLabel')}</dt>
          <dd className="mylab__details-meta-value">{iceLabel(recipe.ice)}</dd>
        </div>
        <div className="mylab__details-meta-item">
          <dt className="mylab__details-meta-label">{t('lab.form.servingsLabel')}</dt>
          <dd className="mylab__details-meta-value">{recipe.servings || 1}</dd>
        </div>
        {recipe.garnish && (
          <div className="mylab__details-meta-item">
            <dt className="mylab__details-meta-label">{t('lab.form.garnishLabel')}</dt>
            <dd className="mylab__details-meta-value">{recipe.garnish}</dd>
          </div>
        )}
      </dl>

      {recipe.ingredients && recipe.ingredients.length > 0 && (
        <section className="mylab__details-section">
          <h2 className="mylab__details-section-title">
            {t('lab.form.sectionIngredients')}
          </h2>
          <ul className="mylab__details-ingredients">
            {recipe.ingredients.map(renderIngredient)}
          </ul>
        </section>
      )}

      {recipe.preparation && recipe.preparation.length > 0 && (
        <section className="mylab__details-section">
          <h2 className="mylab__details-section-title">
            {t('lab.form.sectionSteps')}
          </h2>
          <ol className="mylab__details-steps">
            {recipe.preparation.map((step, index) => (
              <li key={index} className="mylab__details-step">
                <span className="mylab__details-step-number">{index + 1}</span>
                <span className="mylab__details-step-text">{step}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {recipe.notes && (
        <section className="mylab__details-section">
          <h2 className="mylab__details-section-title">
            {t('lab.form.sectionNotes')}
          </h2>
          <p className="mylab__details-notes">{recipe.notes}</p>
        </section>
      )}

      <p className="mylab__details-meta-footer">
        {t('lab.recipes.sourceManual')}
        {' · '}
        {new Date(recipe.updatedAt).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })}
      </p>
    </main>
  );
}

export default RecipeDetails;