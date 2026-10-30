import { useEffect } from 'react';
import './TechCard.css';
import useLanguage from '../../hooks/useLanguage';
import {
  CATEGORIES,
  METHODS,
  GLASSWARE_OPTIONS,
  ICE_OPTIONS,
  UNITS,
} from '../../data/labOptions';

function TechCard({ item, type, onClose }) {
  const { t } = useLanguage();

  // Автоматически вызываем диалог печати при открытии оверлея
  useEffect(() => {
    // Небольшая задержка, чтобы браузер успел отрендерить оверлей до печати
    const timer = setTimeout(() => {
      window.print();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  if (!item) return null;

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

  const isPrep = type === 'prep';
  const title = isPrep ? t('techcard.prepTitle') : t('techcard.recipeTitle');

  return (
    <div className="techcard__overlay">
      <div className="techcard__container">
        <button type="button" className="techcard__close" onClick={onClose}>
          ×
        </button>

        <div className="techcard__document">
          <header className="techcard__header">
            <p className="techcard__brand">BARLOG</p>
            <h1 className="techcard__title">{item.name}</h1>
            <p className="techcard__category">{categoryLabel(item.category)}</p>
          </header>

          <div className="techcard__meta-grid">
            {isPrep ? (
              <>
                {item.yieldAmount && (
                  <div className="techcard__meta-item">
                    <span className="techcard__meta-label">{t('prep.yieldLabel')}</span>
                    <span className="techcard__meta-value">
                      {item.yieldAmount} {item.yieldUnit ? unitLabel(item.yieldUnit) : ''}
                    </span>
                  </div>
                )}
                {item.shelfLife && (
                  <div className="techcard__meta-item">
                    <span className="techcard__meta-label">{t('prep.shelfLifeLabel')}</span>
                    <span className="techcard__meta-value">{item.shelfLife}</span>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="techcard__meta-item">
                  <span className="techcard__meta-label">{t('lab.form.methodLabel')}</span>
                  <span className="techcard__meta-value">{methodLabel(item.method)}</span>
                </div>
                <div className="techcard__meta-item">
                  <span className="techcard__meta-label">{t('lab.form.glasswareLabel')}</span>
                  <span className="techcard__meta-value">{glasswareLabel(item.glassware)}</span>
                </div>
                <div className="techcard__meta-item">
                  <span className="techcard__meta-label">{t('lab.form.iceLabel')}</span>
                  <span className="techcard__meta-value">{iceLabel(item.ice)}</span>
                </div>
                <div className="techcard__meta-item">
                  <span className="techcard__meta-label">{t('lab.form.servingsLabel')}</span>
                  <span className="techcard__meta-value">{item.servings || 1}</span>
                </div>
              </>
            )}
          </div>

          {item.ingredients && item.ingredients.length > 0 && (
            <section className="techcard__section">
              <h2 className="techcard__section-title">
                {t('lab.form.sectionIngredients')}
              </h2>
              <table className="techcard__table">
                <thead>
                  <tr>
                    <th>{t('lab.form.ingredientNameLabel')}</th>
                    <th>{t('lab.form.ingredientAmountLabel')}</th>
                  </tr>
                </thead>
                <tbody>
                  {item.ingredients.map((ing, index) => (
                    <tr key={ing.id || index}>
                      <td>{ing.name}</td>
                      <td>
                        {ing.amount} {ing.unit ? unitLabel(ing.unit) : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {isPrep ? (
            item.method && (
              <section className="techcard__section">
                <h2 className="techcard__section-title">
                  {t('prep.methodLabel')}
                </h2>
                <p className="techcard__text">{item.method}</p>
              </section>
            )
          ) : (
            item.preparation && item.preparation.length > 0 && (
              <section className="techcard__section">
                <h2 className="techcard__section-title">
                  {t('lab.form.sectionSteps')}
                </h2>
                <ol className="techcard__steps">
                  {item.preparation.map((step, index) => (
                    <li key={index} className="techcard__step">
                      {step}
                    </li>
                  ))}
                </ol>
              </section>
            )
          )}

          {item.notes && (
            <section className="techcard__section">
              <h2 className="techcard__section-title">
                {t('lab.form.sectionNotes')}
              </h2>
              <p className="techcard__text">{item.notes}</p>
            </section>
          )}

          <footer className="techcard__footer">
            {t('techcard.generatedBy')} BARLOG · {new Date(item.updatedAt).toLocaleDateString()}
          </footer>
        </div>
      </div>
    </div>
  );
}

export default TechCard;