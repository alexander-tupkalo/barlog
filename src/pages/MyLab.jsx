import "./MyLab.css";
import { useState, useEffect, useRef } from "react";
import useLanguage from "../hooks/useLanguage";
import useAuth from "../hooks/useAuth";
import TechCard from "../components/lab/TechCard";
import {
  saveImage,
  loadImage,
  deleteImage,
  isImageStorageAvailable,
} from "../utils/imageStorage";
import {
  uploadRecipeImage,
  deleteRecipeImage,
} from "../utils/recipeRepository";

import {
  CATEGORIES,
  METHODS,
  GLASSWARE_OPTIONS,
  ICE_OPTIONS,
  UNITS,
} from "../data/labOptions";
import {
  generateId,
  generateRecipeId,
  createEmptyIngredient,
  createEmptyStep,
  createEmptyImage,
  createEmptyForm,
  loadFormFromRecipe,
  getRecipeImageUrl,
} from "../utils/labRecipeHelpers";

import RecipeList from "../components/lab/RecipeList";
import RecipeForm from "../components/lab/RecipeForm";
import RecipeDetails from "../components/lab/RecipeDetails";

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

function MyLab({
  labRecipes = [],
  prepProducts = [],
  handleSaveRecipe,
  handleDeleteRecipe,
  onOpenPrep,
}) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const isAuthed = Boolean(user);

  const [mode, setMode] = useState("list");
  const [viewingRecipeId, setViewingRecipeId] = useState(null);
  const [editingRecipeId, setEditingRecipeId] = useState(null);
  const [form, setForm] = useState(createEmptyForm);
  const [nameError, setNameError] = useState("");
  const [brokenImageIds, setBrokenImageIds] = useState({});

  const [previewUrl, setPreviewUrl] = useState(null);
  const [pendingFile, setPendingFile] = useState(null);
  const [imageError, setImageError] = useState("");
  const [isSavingImage, setIsSavingImage] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);

  const fileInputRef = useRef(null);
  const [isPrinting, setIsPrinting] = useState(false);

  const viewingRecipe = viewingRecipeId
    ? labRecipes.find((r) => r.id === viewingRecipeId)
    : null;

  // Для гостей — IndexedDB должен быть доступен. Для залогиненных — не требуется.
  const imageStorageAvailable = isAuthed || isImageStorageAvailable();

  /* ---------- Загрузка текущего изображения ---------- */
  useEffect(() => {
    if (mode !== "details" || !viewingRecipe) {
      setCurrentImageUrl(null);
      return undefined;
    }

    // Для залогиненных — берём URL напрямую из PB (recipe.imageUrl или image.url)
    if (isAuthed) {
      const pbUrl = viewingRecipe.imageUrl || viewingRecipe.image?.url || null;
      setCurrentImageUrl(pbUrl);
      return undefined;
    }

    // Для гостей — загружаем Blob из IndexedDB
    let revoked = false;
    const storageKey = viewingRecipe.image?.storageKey;

    if (typeof storageKey !== "string" || !storageKey) {
      setCurrentImageUrl(getRecipeImageUrl(viewingRecipe));
      return undefined;
    }

    loadImage(storageKey)
      .then((blob) => {
        if (revoked) return;
        if (blob) {
          const url = URL.createObjectURL(blob);
          setCurrentImageUrl(url);
        } else {
          setCurrentImageUrl(null);
        }
      })
      .catch((err) => {
        console.warn("BARLOG: не вдалося завантажити фото з IndexedDB", err);
        setCurrentImageUrl(null);
      });

    return () => {
      revoked = true;
    };
  }, [mode, viewingRecipeId, viewingRecipe, isAuthed]);

  // Отзыв object URL для гостей при размонтировании
  useEffect(() => {
    return () => {
      if (currentImageUrl && currentImageUrl.startsWith("blob:")) {
        URL.revokeObjectURL(currentImageUrl);
      }
    };
  }, [currentImageUrl]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleOpenList = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setPendingFile(null);
    setImageError("");
    setMode("list");
    setViewingRecipeId(null);
    setEditingRecipeId(null);
    setForm(createEmptyForm());
    setNameError("");
  };

  const handleOpenDetails = (recipeId) => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setPendingFile(null);
    setImageError("");
    setViewingRecipeId(recipeId);
    setMode("details");
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const handleOpenCreate = () => {
    setForm(createEmptyForm());
    setNameError("");
    setEditingRecipeId(null);
    setMode("create");
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const handleOpenEdit = (recipe) => {
    setForm(loadFormFromRecipe(recipe));
    setNameError("");
    setEditingRecipeId(recipe.id);
    setMode("edit");
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const handleCancelForm = () => {
    setForm(createEmptyForm());
    setNameError("");
    setEditingRecipeId(null);
    if (viewingRecipeId) {
      setMode("details");
    } else {
      setMode("list");
    }
  };

  const handleFieldChange = (field) => (event) => {
    const value = event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === "name" && nameError) setNameError("");
  };

  const handleServingsChange = (event) => {
    const raw = event.target.value;
    if (raw === "") {
      setForm((prev) => ({ ...prev, servings: "" }));
      return;
    }
    const num = Number(raw);
    if (!Number.isNaN(num) && num > 0) {
      setForm((prev) => ({ ...prev, servings: num }));
    }
  };

  const handleAddIngredient = () => {
    setForm((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, createEmptyIngredient()],
    }));
  };

  const handleRemoveIngredient = (ingredientId) => {
    setForm((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((ing) => ing.id !== ingredientId),
    }));
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
  };

  const handleAddStep = () => {
    setForm((prev) => ({
      ...prev,
      preparation: [...prev.preparation, createEmptyStep()],
    }));
  };

  const handleRemoveStep = (index) => {
    setForm((prev) => ({
      ...prev,
      preparation: prev.preparation.filter((_, i) => i !== index),
    }));
  };

  const handleStepChange = (index, value) => {
    setForm((prev) => ({
      ...prev,
      preparation: prev.preparation.map((step, i) =>
        i === index ? value : step,
      ),
    }));
  };

  const handleMoveStep = (index, direction) => {
    setForm((prev) => {
      const steps = [...prev.preparation];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= steps.length) return prev;
      [steps[index], steps[targetIndex]] = [steps[targetIndex], steps[index]];
      return { ...prev, preparation: steps };
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmedName = form.name.trim();
    if (!trimmedName) {
      setNameError(t("lab.form.nameRequired"));
      return;
    }

    const now = Date.now();
    const isEditing = mode === "edit" && editingRecipeId;
    const existingRecipe = isEditing
      ? labRecipes.find((r) => r.id === editingRecipeId)
      : null;

    const id = isEditing ? existingRecipe.id : generateRecipeId();
    const createdAt = isEditing ? existingRecipe.createdAt : now;

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

    const cleanedSteps = form.preparation
      .map((step) => (typeof step === "string" ? step.trim() : ""))
      .filter((step) => step.length > 0);

    // Для залогиненных сохраняем существующее image (PB управляет им через uploadRecipeImage).
    // Для гостей — сохраняем существующий storageKey.
    const image = isEditing
      ? existingRecipe.image || createEmptyImage()
      : createEmptyImage();

    const savedRecipe = {
      id,
      source: isEditing ? existingRecipe.source : "manual",
      name: trimmedName,
      category: form.category,
      description: form.description.trim(),
      servings: typeof form.servings === "number" ? form.servings : 1,
      ingredients: cleanedIngredients,
      method: form.method,
      glassware: form.glassware,
      ice: form.ice,
      garnish: form.garnish.trim(),
      preparation: cleanedSteps,
      notes: form.notes.trim(),
      image,
      createdAt,
      updatedAt: now,
    };

    handleSaveRecipe(savedRecipe);

    setViewingRecipeId(id);
    setForm(createEmptyForm());
    setNameError("");
    setEditingRecipeId(null);
    setMode("details");
  };

  const handleDelete = (recipe) => {
    const message = t("lab.confirmDelete").replace("{name}", recipe.name);
    if (window.confirm(message)) {
      // Для гостей — отдельно удаляем из IndexedDB.
      // Для залогиненных — PB удалит файл каскадом с записью рецепта.
      if (!isAuthed) {
        const storageKey = recipe.image?.storageKey;
        if (typeof storageKey === "string" && storageKey) {
          deleteImage(storageKey).catch((err) => {
            console.warn("BARLOG: не вдалося видалити фото з IndexedDB", err);
          });
        }
      }
      handleDeleteRecipe(recipe.id);
      if (viewingRecipeId === recipe.id) {
        handleOpenList();
      }
    }
  };

  const validateImageFile = (file) => {
    if (!file) return t("lab.image.errorGeneric");
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return t("lab.image.errorType");
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return t("lab.image.errorSize");
    }
    return "";
  };

  const handleOpenFilePicker = () => {
    setImageError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    if (!file) {
      return;
    }

    const error = validateImageFile(file);
    if (error) {
      setImageError(error);
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setPendingFile(file);
    setImageError("");
  };

  const handleCancelPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setPendingFile(null);
    setImageError("");
  };

  const handleConfirmImage = async () => {
    if (!pendingFile || !viewingRecipe || isSavingImage) return;

    setIsSavingImage(true);
    setImageError("");

    const recipeId = viewingRecipe.id;
    const now = Date.now();

    try {
      if (isAuthed) {
        // Залогиненный → загрузка в PB
        const newImageUrl = await uploadRecipeImage(recipeId, pendingFile);

        const updatedRecipe = {
          ...viewingRecipe,
          image: {
            url: newImageUrl,
            status: "uploaded",
            updatedAt: now,
            storageKey: null,
          },
          imageUrl: newImageUrl,
          updatedAt: now,
        };
        handleSaveRecipe(updatedRecipe);

        // Обновляем текущий URL (старый был PB URL, не нужно отзывить)
        setCurrentImageUrl(newImageUrl);
      } else {
        // Гость → IndexedDB (существующая логика)
        const storageKey = `lab-img-${recipeId}`;
        const oldStorageKey = viewingRecipe.image?.storageKey;

        await saveImage(storageKey, pendingFile);

        const updatedRecipe = {
          ...viewingRecipe,
          image: {
            url: null,
            status: "uploaded",
            updatedAt: now,
            storageKey,
          },
          updatedAt: now,
        };
        handleSaveRecipe(updatedRecipe);

        if (
          typeof oldStorageKey === "string" &&
          oldStorageKey &&
          oldStorageKey !== storageKey
        ) {
          await deleteImage(oldStorageKey).catch((err) => {
            console.warn("BARLOG: не вдалося видалити старе фото", err);
          });
        }
      }

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);
      setPendingFile(null);
    } catch (err) {
      console.error("BARLOG: не вдалося зберегти фото", err);
      setImageError(t("lab.image.errorSave"));
    } finally {
      setIsSavingImage(false);
    }
  };

  const categoryLabel = (categoryId) => {
    const found = CATEGORIES.find((c) => c.id === categoryId);
    return found ? t(found.labelKey) : categoryId;
  };

  const isEmpty = labRecipes.length === 0;

  if (isPrinting && viewingRecipe) {
    return (
      <TechCard
        item={viewingRecipe}
        type="recipe"
        onClose={() => setIsPrinting(false)}
      />
    );
  }

  if (mode === "details" && viewingRecipe) {
    const imageProps = {
      currentImageUrl,
      previewUrl,
      brokenImageIds,
      setBrokenImageIds,
      imageStorageAvailable,
      imageError,
      isSavingImage,
      fileInputRef,
      acceptedImageTypes: ACCEPTED_IMAGE_TYPES,
      onOpenFilePicker: handleOpenFilePicker,
      onFileChange: handleFileChange,
      onConfirmImage: handleConfirmImage,
      onCancelPreview: handleCancelPreview,
    };

    return (
      <RecipeDetails
        recipe={viewingRecipe}
        prepProducts={prepProducts}
        imageProps={imageProps}
        onBack={handleOpenList}
        onEdit={() => handleOpenEdit(viewingRecipe)}
        onDelete={() => handleDelete(viewingRecipe)}
        onOpenPrep={onOpenPrep}
        onPrint={() => setIsPrinting(true)}
      />
    );
  }

  if (mode === "create" || mode === "edit") {
    const isEditing = mode === "edit";

    return (
      <RecipeForm
        form={form}
        prepProducts={prepProducts}
        nameError={nameError}
        isEditing={isEditing}
        onFieldChange={handleFieldChange}
        onServingsChange={handleServingsChange}
        onAddIngredient={handleAddIngredient}
        onRemoveIngredient={handleRemoveIngredient}
        onIngredientChange={handleIngredientChange}
        onIngredientPrepSelect={handleIngredientPrepSelect}
        onAddStep={handleAddStep}
        onRemoveStep={handleRemoveStep}
        onStepChange={handleStepChange}
        onMoveStep={handleMoveStep}
        onSubmit={handleSubmit}
        onCancel={handleCancelForm}
      />
    );
  }

  return (
    <main className="mylab" aria-label={t("lab.title")}>
      <RecipeList
        recipes={labRecipes}
        onOpenCreate={handleOpenCreate}
        onOpenDetails={handleOpenDetails}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
        categoryLabel={categoryLabel}
      />
    </main>
  );
}

export default MyLab;