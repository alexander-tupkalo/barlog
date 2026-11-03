import { useState, useEffect } from 'react';
import { loadImage } from '../../utils/imageStorage';
import { getRecipeImageUrl } from '../../utils/labRecipeHelpers';

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
   RecipeCardImage — загрузка и отображение фото в карточке списка.
   Поддерживает два режима:
     - Залогиненный: прямой URL из PB (recipe.imageUrl или recipe.image.url)
     - Гость: загрузка Blob из IndexedDB по storageKey
   ============================================================ */
function RecipeCardImage({ recipe, altText }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [isBroken, setIsBroken] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let objectUrl = null;

    setIsBroken(false);

    // 1. Прямой URL (PB для залогиненных, или legacy recipe.image.url)
    const directUrl = getRecipeImageUrl(recipe) || recipe?.imageUrl;

    if (directUrl) {
      setImageUrl(directUrl);
      return () => {
        cancelled = true;
      };
    }

    // 2. Storage key (для гостей — IndexedDB)
    const storageKey = recipe?.image?.storageKey;

    if (storageKey) {
      setImageUrl(null);
      loadImage(storageKey)
        .then((blob) => {
          if (cancelled) return;
          if (blob) {
            objectUrl = URL.createObjectURL(blob);
            setImageUrl(objectUrl);
          } else {
            setImageUrl(null);
          }
        })
        .catch(() => {
          if (cancelled) return;
          setImageUrl(null);
        });

      return () => {
        cancelled = true;
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl);
        }
      };
    }

    setImageUrl(null);
    return () => {
      cancelled = true;
    };
  }, [recipe?.image?.storageKey, recipe?.image?.url, recipe?.imageUrl]);

  if (!imageUrl || isBroken) {
    return (
      <div
        className="mylab__card-placeholder"
        role="img"
        aria-label={altText}
      >
        <CocktailGlassIcon />
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={altText}
      className="mylab__card-image"
      loading="lazy"
      onError={() => setIsBroken(true)}
    />
  );
}

export default RecipeCardImage;