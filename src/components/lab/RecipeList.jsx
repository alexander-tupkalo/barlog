import Button from '../ui/Button';
import EmptyState from '../ui/EmptyState';
import Tag from '../ui/Tag';
import RecipeCardImage from './RecipeCardImage';
import useLanguage from '../../hooks/useLanguage';

/* Іконки, що використовуються у списку рецептів.
   Переносяться сюди з MyLab.jsx — без змін у SVG-розмітці. */
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
      className="mylab__icon"
    >
      <path d="M12 5v14M5 12h14" />
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
      className="mylab__icon-action"
    >
      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
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
      className="mylab__icon-action"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

/* ============================================================
   RecipeList — список рецептів My Lab.

   Відповідальність:
     - рендер заголовка секції (eyebrow + title + intro + кнопка «Створити»)
     - empty-state, коли рецептів немає
     - сітка карток рецептів
     - делегування відкриття деталей/редагування/видалення через колбеки
     - відображення фото через RecipeCardImage
     - тег категорії через Tag
     - stretched button для відкриття деталей

   Не відповідає за:
     - стан режимів (list/details/create/edit) — це у MyLab.jsx
     - завантаження фото, IndexedDB — це у RecipeImageManager/MyLab
     - форму створення/редагування — це RecipeForm
     - деталі рецепту — це RecipeDetails
   ============================================================ */

/**
 * @param {Array} recipes — масив рецептів зі стану App
 * @param {Function} onOpenCreate — колбек відкриття форми створення
 * @param {Function} onOpenDetails — колбек відкриття деталей (приймає recipeId)
 * @param {Function} onEdit — колбек відкриття форми редагування (приймає recipe)
 * @param {Function} onDelete — колбек видалення рецепту (приймає recipe)
 * @param {Function} categoryLabel — хелпер для локалізації категорії за id
 */
function RecipeList({
  recipes,
  onOpenCreate,
  onOpenDetails,
  onEdit,
  onDelete,
  categoryLabel,
}) {
  const { t } = useLanguage();
  const isEmpty = recipes.length === 0;

  if (isEmpty) {
    return (
      <EmptyState
        title={t('empty.labTitle')}
        description={t('empty.labDescription')}
        actionLabel={t('lab.form.create')}
        onAction={onOpenCreate}
      />
    );
  }

  return (
    <>
      <header className="mylab__header">
        <p className="mylab__eyebrow">{t('lab.eyebrow')}</p>
        <h1 className="mylab__title">{t('lab.title')}</h1>
        <p className="mylab__intro">{t('lab.intro')}</p>
        <Button
          variant="primary"
          onClick={onOpenCreate}
          className="mylab__create"
        >
          <PlusIcon />
          <span>{t('lab.form.create')}</span>
        </Button>
      </header>

      <ul className="mylab__list">
        {recipes.map((recipe) => (
          <li key={recipe.id} className="mylab__card">
            <div className="mylab__card-media">
              <RecipeCardImage
                recipe={recipe}
                altText={recipe.name || t('lab.recipes.imageMissingAlt')}
              />
            </div>

            <div className="mylab__card-body">
              <div className="mylab__card-head">
                <h3 className="mylab__card-name">{recipe.name}</h3>
                <Tag>{categoryLabel(recipe.category)}</Tag>
              </div>
              {recipe.description && (
                <p className="mylab__card-description">{recipe.description}</p>
              )}
              {recipe.notes && (
                <p className="mylab__card-notes">{recipe.notes}</p>
              )}
              <p className="mylab__card-meta">
                {t('lab.recipes.sourceManual')}
                {' · '}
                {new Date(recipe.updatedAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>

            {/* Кнопки дій — siblings stretched button, не вкладені.
                stopPropagation гарантує, що клік по них не відкриє деталі. */}
            <button
              type="button"
              className="mylab__card-action mylab__card-action--edit"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(recipe);
              }}
              aria-label={`${t('lab.form.edit')} ${recipe.name}`}
            >
              <EditIcon />
            </button>
            <button
              type="button"
              className="mylab__card-action mylab__card-action--delete"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(recipe);
              }}
              aria-label={`${t('lab.form.delete')} ${recipe.name}`}
            >
              <TrashIcon />
            </button>

            {/* Stretched button — покриває всю картку, відкриває деталі. */}
            <button
              type="button"
              className="mylab__card-open"
              onClick={() => onOpenDetails(recipe.id)}
              aria-label={`${t('lab.details.open')} ${recipe.name}`}
            />
          </li>
        ))}
      </ul>
    </>
  );
}

export default RecipeList;