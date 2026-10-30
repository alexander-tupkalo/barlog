import { useState, useRef, useCallback, useEffect } from "react";
import "./App.css";
import AppHeader from "./components/layout/AppHeader";
import BottomNavigation from "./components/layout/BottomNavigation";
import LanguageProvider from "./context/LanguageContext";
import Home from "./pages/Home";
import CocktailLibrary from "./pages/CocktailLibrary";
import CocktailDetails from "./pages/CocktailDetails";
import MyLab from "./pages/MyLab";
import PrepLibrary from "./pages/PrepLibrary";
import Assistant from "./pages/Assistant";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import { loadLabRecipes, saveLabRecipes } from "./utils/labStorage";
import {
  loadPrepProducts,
  savePrepProducts,
  createPrepProduct,
  archivePrepProduct,
} from "./utils/prepStorage";

const FAVORITES_STORAGE_KEY = "barlog-favorites";

function loadFavoriteIds() {
  if (typeof window === "undefined" || !window.localStorage) {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id) => typeof id === "string");
  } catch (error) {
    console.warn("BARLOG: не вдалося прочитати обране з localStorage", error);
    return [];
  }
}

function saveFavoriteIds(ids) {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(ids));
  } catch (error) {
    console.warn("BARLOG: не вдалося зберегти обране в localStorage", error);
  }
}

function App() {
  const [activeSection, setActiveSection] = useState("home");
  const [selectedCocktailId, setSelectedCocktailId] = useState(null);
  const [favoriteIds, setFavoriteIds] = useState(loadFavoriteIds);
  const [labRecipes, setLabRecipes] = useState(loadLabRecipes);
  const [prepProducts, setPrepProducts] = useState(loadPrepProducts);

  const savedScrollYRef = useRef(0);

  const handleNavigate = (section) => {
    setActiveSection(section);
    setSelectedCocktailId(null);
  };

  const handleOpenCocktail = (cocktailId) => {
    savedScrollYRef.current = window.scrollY;
    setSelectedCocktailId(cocktailId);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const handleCloseCocktail = () => {
    setSelectedCocktailId(null);
    requestAnimationFrame(() => {
      window.scrollTo({ top: savedScrollYRef.current, behavior: "auto" });
    });
  };

  const handleToggleFavorite = useCallback((cocktailId) => {
    setFavoriteIds((prev) => {
      const next = prev.includes(cocktailId)
        ? prev.filter((id) => id !== cocktailId)
        : [...prev, cocktailId];
      saveFavoriteIds(next);
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (cocktailId) => favoriteIds.includes(cocktailId),
    [favoriteIds],
  );

  const handleSaveRecipe = useCallback((recipe) => {
    if (!recipe || typeof recipe.id !== "string") return;
    setLabRecipes((prev) => {
      const existingIndex = prev.findIndex((r) => r.id === recipe.id);
      if (existingIndex >= 0) {
        return [
          ...prev.slice(0, existingIndex),
          { ...recipe, updatedAt: Date.now() },
          ...prev.slice(existingIndex + 1),
        ];
      }
      return [
        ...prev,
        {
          ...recipe,
          createdAt: recipe.createdAt || Date.now(),
          updatedAt: Date.now(),
        },
      ];
    });
  }, []);

  const handleDeleteRecipe = useCallback((recipeId) => {
    if (typeof recipeId !== "string") return;
    setLabRecipes((prev) => prev.filter((r) => r.id !== recipeId));
  }, []);

  const handleSavePrepProduct = useCallback((prepProduct) => {
    if (!prepProduct || typeof prepProduct.id !== "string") return;
    setPrepProducts((prev) => {
      const nowIso = new Date().toISOString();
      const normalized = createPrepProduct({
        ...prepProduct,
        updatedAt: nowIso,
      });
      const existingIndex = prev.findIndex((p) => p.id === normalized.id);
      if (existingIndex >= 0) {
        return [
          ...prev.slice(0, existingIndex),
          normalized,
          ...prev.slice(existingIndex + 1),
        ];
      }
      return [...prev, normalized];
    });
  }, []);

  const handleArchivePrepProduct = useCallback((prepProductId) => {
    if (typeof prepProductId !== "string") return;
    setPrepProducts((prev) => archivePrepProduct(prev, prepProductId));
  }, []);

  const handleDeletePrepProduct = useCallback((prepProductId) => {
    if (typeof prepProductId !== "string") return;
    setPrepProducts((prev) => prev.filter((p) => p.id !== prepProductId));
  }, []);

  // Колбек для перехода в раздел "Препарати" из My Lab
  const handleOpenPrep = useCallback(() => {
    setActiveSection("prep");
    setSelectedCocktailId(null);
  }, []);

  useEffect(() => {
    saveLabRecipes(labRecipes);
  }, [labRecipes]);

  useEffect(() => {
    savePrepProducts(prepProducts);
  }, [prepProducts]);

  const renderPage = () => {
    switch (activeSection) {
      case "library":
        return (
          <CocktailLibrary
            onOpenCocktail={handleOpenCocktail}
            favoriteIds={favoriteIds}
            onToggleFavorite={handleToggleFavorite}
            isFavorite={isFavorite}
          />
        );
      case "mylab":
        return (
          <MyLab
            labRecipes={labRecipes}
            prepProducts={prepProducts}
            handleSaveRecipe={handleSaveRecipe}
            handleDeleteRecipe={handleDeleteRecipe}
            onOpenPrep={handleOpenPrep}
          />
        );
      case "prep":
        return (
          <PrepLibrary
            prepProducts={prepProducts}
            onSavePrepProduct={handleSavePrepProduct}
            onArchivePrepProduct={handleArchivePrepProduct}
            onDeletePrepProduct={handleDeletePrepProduct}
          />
        );
      case "assistant":
        return <Assistant onNavigate={handleNavigate} />;
      case "profile":
        return <Profile onNavigate={handleNavigate} />;
      case "settings":
        return <Settings onNavigate={handleNavigate} />;
      case "home":
      default:
        return (
          <Home
            onNavigate={handleNavigate}
            onOpenCocktail={handleOpenCocktail}
          />
        );
    }
  };

  return (
    <LanguageProvider>
      <div className="app">
        <AppHeader
          activeSection={activeSection}
          onNavigate={handleNavigate}
          isCocktailOpen={Boolean(selectedCocktailId)}
        />
        <div className="app__main">
          <div
            className={`app__page ${selectedCocktailId ? "app__page--hidden" : ""}`.trim()}
            aria-hidden={selectedCocktailId ? "true" : undefined}
          >
            {renderPage()}
          </div>

          {selectedCocktailId && (
            <CocktailDetails
              cocktailId={selectedCocktailId}
              onBack={handleCloseCocktail}
              isFavorite={isFavorite}
              onToggleFavorite={handleToggleFavorite}
            />
          )}
        </div>
        <BottomNavigation
          activeSection={activeSection}
          onNavigate={handleNavigate}
        />
      </div>
    </LanguageProvider>
  );
}

export default App;
