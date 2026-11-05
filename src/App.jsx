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
import Subscription from "./pages/Subscription";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Upgrade from "./pages/Upgrade";
import useAuth from "./hooks/useAuth";
import useSubscription from "./hooks/useSubscription";
import { loadLabRecipes, saveLabRecipes } from "./utils/labStorage";
import {
  loadPrepProducts,
  savePrepProducts,
  createPrepProduct,
  archivePrepProduct,
} from "./utils/prepStorage";
import {
  loadFavorites,
  addFavorite,
  removeFavorite,
  migrateGuestFavorites,
} from "./utils/favoritesRepository";
import {
  loadRecipes as loadRecipesFromPB,
  saveRecipe as saveRecipeToPB,
  deleteRecipe as deleteRecipeFromPB,
  migrateGuestRecipes,
} from "./utils/recipeRepository";
import {
  loadPreps as loadPrepsFromPB,
  savePrep as savePrepToPB,
  deletePrep as deletePrepFromPB,
  migrateGuestPreps,
} from "./utils/prepRepository";

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
  const [upgradeFeature, setUpgradeFeature] = useState("generic");

  const { user } = useAuth();
  const { isPro } = useSubscription();

  const savedScrollYRef = useRef(0);

  /* ---------- Синхронизация избранного с сервером ---------- */
  useEffect(() => {
    let cancelled = false;

    async function syncFavorites() {
      if (!user) {
        setFavoriteIds(loadFavoriteIds());
        return;
      }

      const guestFavorites = loadFavoriteIds();
      if (guestFavorites.length > 0) {
        const result = await migrateGuestFavorites(guestFavorites);
        if (result.migrated > 0) {
          console.log(`BARLOG: мігровано ${result.migrated} обраних з гостя`);
        }
        saveFavoriteIds([]);
      }

      if (cancelled) return;
      const serverFavorites = await loadFavorites();
      if (!cancelled) setFavoriteIds(serverFavorites);
    }

    syncFavorites();

    return () => {
      cancelled = true;
    };
  }, [user]);

  /* ---------- Синхронизация рецептов с сервером ---------- */
  useEffect(() => {
    let cancelled = false;

    async function syncRecipes() {
      if (!user) {
        setLabRecipes(loadLabRecipes());
        return;
      }

      const guestRecipes = loadLabRecipes();
      if (guestRecipes.length > 0) {
        const result = await migrateGuestRecipes(guestRecipes);
        if (result.migrated > 0) {
          console.log(`BARLOG: мігровано ${result.migrated} рецептів з гостя`);
        }
        saveLabRecipes([]);
      }

      if (cancelled) return;
      const serverRecipes = await loadRecipesFromPB();
      if (!cancelled) setLabRecipes(serverRecipes);
    }

    syncRecipes();

    return () => {
      cancelled = true;
    };
  }, [user]);

  /* ---------- Синхронизация препаратов с сервером ---------- */
  useEffect(() => {
    let cancelled = false;

    async function syncPreps() {
      if (!user) {
        setPrepProducts(loadPrepProducts());
        return;
      }

      // Препараты — Pro-функция. Мигрируем только если пользователь Pro.
      if (!isPro) {
        setPrepProducts([]);
        return;
      }

      const guestPreps = loadPrepProducts();
      if (guestPreps.length > 0) {
        const result = await migrateGuestPreps(guestPreps);
        if (result.migrated > 0) {
          console.log(
            `BARLOG: мігровано ${result.migrated} препаратів з гостя`,
          );
        }
        savePrepProducts([]);
      }

      if (cancelled) return;
      const serverPreps = await loadPrepsFromPB();
      if (!cancelled) setPrepProducts(serverPreps);
    }

    syncPreps();

    return () => {
      cancelled = true;
    };
  }, [user, isPro]);

  const handleNavigate = useCallback(
    (section) => {
      // Только П/Ф — Pro-only. AI теперь доступен всем (лимиты на сервере).
      if (!isPro && section === "prep") {
        setUpgradeFeature("prep");
        setActiveSection("upgrade");
        setSelectedCocktailId(null);
        return;
      }
      if (section !== "upgrade") {
        setUpgradeFeature("generic");
      }
      setActiveSection(section);
      setSelectedCocktailId(null);
    },
    [isPro],
  );

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

  const handleToggleFavorite = useCallback(
    (cocktailId) => {
      const isFav = favoriteIds.includes(cocktailId);
      setFavoriteIds((prev) => {
        const next = isFav
          ? prev.filter((id) => id !== cocktailId)
          : [...prev, cocktailId];
        return next;
      });

      if (user) {
        if (isFav) {
          removeFavorite(cocktailId).catch((err) => {
            console.warn("BARLOG: помилка видалення favorite", err);
            setFavoriteIds((prev) => [...prev, cocktailId]);
          });
        } else {
          addFavorite(cocktailId).catch((err) => {
            console.warn("BARLOG: помилка додавання favorite", err);
            setFavoriteIds((prev) => prev.filter((id) => id !== cocktailId));
          });
        }
      } else {
        setFavoriteIds((prev) => {
          const next = isFav
            ? prev.filter((id) => id !== cocktailId)
            : [...prev, cocktailId];
          saveFavoriteIds(next);
          return next;
        });
      }
    },
    [favoriteIds, user],
  );

  const isFavorite = useCallback(
    (cocktailId) => favoriteIds.includes(cocktailId),
    [favoriteIds],
  );

  const handleSaveRecipe = useCallback(
    (recipe) => {
      if (!recipe || typeof recipe.id !== "string") return;

      if (user) {
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

        saveRecipeToPB(recipe)
          .then((saved) => {
            setLabRecipes((prev) => {
              const index = prev.findIndex(
                (r) => r.id === recipe.id || r.id === saved.id,
              );
              if (index >= 0) {
                const next = [...prev];
                next[index] = saved;
                return next;
              }
              return [saved, ...prev];
            });
          })
          .catch((err) => {
            if (err?.status !== 404) {
              console.warn("BARLOG: помилка збереження рецепта", err);
            }
          });
      } else {
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
      }
    },
    [user],
  );

  const handleDeleteRecipe = useCallback(
    (recipeId) => {
      if (typeof recipeId !== "string") return;

      setLabRecipes((prev) => prev.filter((r) => r.id !== recipeId));

      if (user) {
        deleteRecipeFromPB(recipeId).catch((err) => {
          console.warn("BARLOG: помилка видалення рецепта", err);
        });
      }
    },
    [user],
  );

  const handleSavePrepProduct = useCallback(
    (prepProduct) => {
      if (!prepProduct || typeof prepProduct.id !== "string") return;

      if (user) {
        // Залогиненный → PB (оптимистичное обновление)
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

        // Асинхронное сохранение в PB
        savePrepToPB(prepProduct)
          .then((saved) => {
            setPrepProducts((prev) => {
              const index = prev.findIndex(
                (p) => p.id === prepProduct.id || p.id === saved.id,
              );
              if (index >= 0) {
                const next = [...prev];
                next[index] = saved;
                return next;
              }
              return [saved, ...prev];
            });
          })
          .catch((err) => {
            if (err?.status !== 404) {
              console.warn("BARLOG: помилка збереження препарату", err);
            }
          });
      } else {
        // Гость → localStorage
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
      }
    },
    [user],
  );

  const handleArchivePrepProduct = useCallback((prepProductId) => {
    if (typeof prepProductId !== "string") return;
    setPrepProducts((prev) => archivePrepProduct(prev, prepProductId));
  }, []);

  const handleDeletePrepProduct = useCallback(
    (prepProductId) => {
      if (typeof prepProductId !== "string") return;

      setPrepProducts((prev) => prev.filter((p) => p.id !== prepProductId));

      if (user) {
        deletePrepFromPB(prepProductId).catch((err) => {
          console.warn("BARLOG: помилка видалення препарату", err);
        });
      }
    },
    [user],
  );

  const handleOpenPrep = useCallback(() => {
    handleNavigate("prep");
  }, [handleNavigate]);

  // Сохраняем в localStorage только для гостя
  useEffect(() => {
    if (!user) {
      saveLabRecipes(labRecipes);
    }
  }, [labRecipes, user]);

  useEffect(() => {
    if (!user) {
      savePrepProducts(prepProducts);
    }
  }, [prepProducts, user]);

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
      case "subscription":
        return <Subscription onNavigate={handleNavigate} />;
      case "login":
        return <Login onNavigate={handleNavigate} />;
      case "register":
        return <Register onNavigate={handleNavigate} />;
      case "upgrade":
        return <Upgrade feature={upgradeFeature} onNavigate={handleNavigate} />;
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
