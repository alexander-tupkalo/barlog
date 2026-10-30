import Button from '../ui/Button';
import useLanguage from '../../hooks/useLanguage';

/* ============================================================
   Іконки для секції фото.
   Переносяться сюди з MyLab.jsx — без змін у SVG-розмітці.
   ============================================================ */
function CameraIcon() {
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
      className="mylab__icon"
    >
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function CheckIcon() {
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
      className="mylab__icon-action"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function CocktailGlassIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className="mylab__placeholder-icon"
    >
      <path d="M6 4h12l-1 6a5 5 0 0 1-10 0z" />
      <path d="M6 4H4M18 4h2" />
      <path d="M12 15v5M9 20h6" />
    </svg>
  );
}

/* ============================================================
   RecipeImageManager — керування зображенням рецепту.

   Відповідальність:
     - рендер hero-зображення (поточне фото / прев'ю / плейсхолдер)
     - рендер секції керування фото (кнопка «Додати/Замінити»,
       прев'ю з підтвердженням/скасуванням, повідомлення про помилку,
       прихований file input)
     - обчислення похідних станів (showPreview, showImage тощо)
     - виклик колбеків MyLab при взаємодії

   Не відповідає за:
     - стан зображення (previewUrl, currentImageUrl, imageError тощо) — у MyLab
     - створення/відкликання object URL — у MyLab
     - IndexedDB-операції — у MyLab
     - валідацію файлу — у MyLab
   ============================================================ */

/**
 * @param {object} recipe — поточний рецепт (для id, name, alt)
 * @param {string|null} currentImageUrl — збережене фото (object URL або прямий URL)
 * @param {string|null} previewUrl — прев'ю нового файлу (object URL)
 * @param {object} brokenImageIds — карта збитих зображень { [recipeId]: true }
 * @param {Function} setBrokenImageIds — setter для карти збитих зображень
 * @param {boolean} imageStorageAvailable — чи доступний IndexedDB
 * @param {string} imageError — локалізоване повідомлення про помилку
 * @param {boolean} isSavingImage — чи триває збереження
 * @param {object} fileInputRef — ref для прихованого file input
 * @param {Array} acceptedImageTypes — допустимі MIME-типи
 * @param {Function} onOpenFilePicker — відкрити файловий діалог
 * @param {Function} onFileChange — обробник вибору файлу
 * @param {Function} onConfirmImage — підтвердити заміну
 * @param {Function} onCancelPreview — скасувати прев'ю
 */
function RecipeImageManager({
  recipe,
  currentImageUrl,
  previewUrl,
  brokenImageIds,
  setBrokenImageIds,
  imageStorageAvailable,
  imageError,
  isSavingImage,
  fileInputRef,
  acceptedImageTypes,
  onOpenFilePicker,
  onFileChange,
  onConfirmImage,
  onCancelPreview,
}) {
  const { t } = useLanguage();

  // Похідні стани — обчислюємо тут, MyLab не потрібно їх передавати.
  const showPreview = Boolean(previewUrl);
  const isBroken = Boolean(brokenImageIds && brokenImageIds[recipe.id]);
  const showImage = showPreview || (Boolean(currentImageUrl) && !isBroken);
  const displayedUrl = showPreview ? previewUrl : currentImageUrl;
  const hasExistingImage = Boolean(currentImageUrl) && !isBroken;

  const handleImageError = () => {
    // Під час прев'ю не позначаємо як збитий — прев'ю завжди показуємо.
    if (showPreview) return;
    setBrokenImageIds((prev) =>
      prev && prev[recipe.id] ? prev : { ...(prev || {}), [recipe.id]: true }
    );
  };

  return (
    <>
      {/* HERO: фото або плейсхолдер.
          Якщо є preview — показуємо його з badge «Прев'ю». */}
      <div className="mylab__details-media">
        {showImage ? (
          <>
            <img
              src={displayedUrl}
              alt={recipe.name}
              className="mylab__details-image"
              onError={handleImageError}
            />
            {showPreview && (
              <span className="mylab__image-badge">
                {t('lab.image.previewBadge')}
              </span>
            )}
          </>
        ) : (
          <div
            className="mylab__details-placeholder"
            role="img"
            aria-label={recipe.name || t('lab.recipes.imageMissingAlt')}
          >
            <CocktailGlassIcon />
          </div>
        )}
      </div>

      {/* СЕКЦІЯ УПРАВЛІННЯ ФОТО
          Видна лише якщо IndexedDB доступний.
          Коли preview активне — показуємо кнопки «Підтвердити»/«Скасувати».
          Інакше — кнопку «Додати фото» або «Замінити фото». */}
      {imageStorageAvailable && (
        <section
          className="mylab__image-section"
          aria-label={t('lab.image.sectionLabel')}
        >
          {!showPreview && (
            <Button
              variant="secondary"
              onClick={onOpenFilePicker}
              className="mylab__image-action"
            >
              <CameraIcon />
              <span>
                {hasExistingImage
                  ? t('lab.image.replace')
                  : t('lab.image.add')}
              </span>
            </Button>
          )}

          {/* Прев'ю: підтвердження або скасування. */}
          {showPreview && (
            <div className="mylab__image-preview">
              <p className="mylab__image-preview-text">
                {t('lab.image.confirmPrompt')}
              </p>
              <div className="mylab__image-preview-actions">
                <Button
                  variant="primary"
                  onClick={onConfirmImage}
                  disabled={isSavingImage}
                >
                  <CheckIcon />
                  <span>
                    {isSavingImage
                      ? t('lab.image.saving')
                      : t('lab.image.confirm')}
                  </span>
                </Button>
                <Button
                  variant="secondary"
                  onClick={onCancelPreview}
                  disabled={isSavingImage}
                >
                  {t('lab.image.cancel')}
                </Button>
              </div>
            </div>
          )}

          {imageError && (
            <p className="mylab__image-error" role="alert">
              {imageError}
            </p>
          )}

          {/* Прихований input file. Керується через ref. */}
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedImageTypes.join(',')}
            onChange={onFileChange}
            className="mylab__file-input"
            aria-label={t('lab.image.inputLabel')}
          />
        </section>
      )}
    </>
  );
}

export default RecipeImageManager;