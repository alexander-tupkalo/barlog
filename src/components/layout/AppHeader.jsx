import "./AppHeader.css";
import { useState, useEffect, useRef } from "react";
import useLanguage from "../../hooks/useLanguage";

const NAV_ITEMS = [
  { id: "home", key: "nav.home" },
  { id: "library", key: "nav.library" },
  { id: "mylab", key: "nav.mylab" },
  { id: "prep", key: "nav.prep" },
  { id: "assistant", key: "nav.assistant" },
];

const LANGUAGES = [
  { value: "uk", short: "UA" },
  { value: "ru", short: "RU" },
];

function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="app-header__lang" role="group" aria-label="Мова інтерфейсу">
      {LANGUAGES.map((lang) => {
        const isActive = language === lang.value;
        return (
          <button
            key={lang.value}
            type="button"
            className={`app-header__lang-btn ${
              isActive ? "app-header__lang-btn--active" : ""
            }`.trim()}
            aria-pressed={isActive}
            aria-label={`Встановити мову: ${lang.short}`}
            onClick={() => setLanguage(lang.value)}
          >
            {lang.short}
          </button>
        );
      })}
    </div>
  );
}

function ProfileIcon() {
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
      className="account-menu__icon"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  );
}

function AccountMenu({ onNavigate }) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleItemClick = (section) => {
    setIsOpen(false);
    triggerRef.current?.focus();
    if (onNavigate) {
      onNavigate(section);
    }
  };

  return (
    <div className="account-menu" ref={containerRef}>
      <button
        ref={triggerRef}
        type="button"
        className="account-menu__trigger"
        aria-label={t("account.menuLabel")}
        aria-expanded={isOpen}
        aria-haspopup="true"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <ProfileIcon />
      </button>

      {isOpen && (
        <div className="account-menu__dropdown" role="menu">
          <button
            type="button"
            className="account-menu__item"
            role="menuitem"
            onClick={() => handleItemClick("profile")}
          >
            {t("account.profile")}
          </button>
          <button
            type="button"
            className="account-menu__item"
            role="menuitem"
            onClick={() => handleItemClick("settings")}
          >
            {t("account.settings")}
          </button>
        </div>
      )}
    </div>
  );
}

function AppHeader({ activeSection, onNavigate, isCocktailOpen = false }) {
  const { t } = useLanguage();

  const isTransparent = activeSection === "home" && !isCocktailOpen;

  return (
    <header
      className={`app-header${isTransparent ? " app-header--transparent" : ""}`}
    >
      <div className="app-header__inner">
        <div className="app-header__top">
          <button
            type="button"
            className="app-header__brand"
            onClick={() => onNavigate("home")}
            aria-label="BARLOG — на головну"
          >
            <img
              src={`${import.meta.env.BASE_URL}${
                isTransparent ? "barlog-logo-light.svg" : "barlog-logo.svg"
              }`}
              alt="BARLOG"
              className="app-header__logo"
              width="200"
              height="48"
            />
          </button>

          <div className="app-header__actions">
            <LanguageSwitcher />
            <AccountMenu onNavigate={onNavigate} />
          </div>
        </div>

        <nav className="app-header__nav" aria-label="Основна навігація">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`app-header__nav-item ${
                  isActive ? "app-header__nav-item--active" : ""
                }`.trim()}
                aria-current={isActive ? "page" : undefined}
                onClick={() => onNavigate(item.id)}
              >
                {t(item.key)}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

export default AppHeader;
