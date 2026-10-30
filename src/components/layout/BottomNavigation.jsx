import './BottomNavigation.css';
import useLanguage from '../../hooks/useLanguage';

/* 4 бічних пункти навігації (по 2 з кожного боку від центральної FAB). */
const SIDE_ITEMS = [
  { id: 'home', key: 'nav.home', icon: 'home' },
  { id: 'library', key: 'nav.library', icon: 'library' },
  { id: 'mylab', key: 'nav.mylab', icon: 'lab' },
  { id: 'prep', key: 'nav.prep', icon: 'prep' },
];

/* Центральна FAB-кнопка — Асистент (піднята над панеллю). */
const FAB_ITEM = { id: 'assistant', key: 'nav.assistant' };

const ICONS = {
  home: (
    <path d="M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5M9 21v-7h6v7" />
  ),
  library: (
    <>
      <path d="M4 5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2z" />
      <path d="M4 19a2 2 0 0 1 2-2h12" />
    </>
  ),
  lab: (
    <>
      <path d="M9 3h6" />
      <path d="M10 3v6L4.5 18a2 2 0 0 0 1.8 3h11.4a2 2 0 0 0 1.8-3L14 9V3" />
      <path d="M7 15h10" />
    </>
  ),
  prep: (
    <>
      <path d="M10 2h4v3l1.5 3v12a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2V8L10 5V2z" />
      <path d="M10 2h4" />
    </>
  ),
  /* Іконка «sparkles» — символ AI-асистента.
     Велика 4-променева зірка + 2 малі зірочки (Lucide sparkles). */
  sparkles: (
    <>
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .962 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.962 0z" />
      <path d="M20 3v4" />
      <path d="M22 5h-4" />
      <path d="M4 17v2" />
      <path d="M5 18H3" />
    </>
  ),
};

function Icon({ name }) {
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
      className="bottom-nav__icon"
    >
      {ICONS[name]}
    </svg>
  );
}

function BottomNavigation({ activeSection, onNavigate }) {
  const { t } = useLanguage();

  const isFabActive = activeSection === FAB_ITEM.id;

  return (
    <nav className="bottom-nav" aria-label="Основна навігація">
      {/* Ряд з 4 бічних пунктів + центральний слот для FAB */}
      <div className="bottom-nav__row">
        {/* Ліва сторона: 2 пункти */}
        {SIDE_ITEMS.slice(0, 2).map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`bottom-nav__item ${
                isActive ? 'bottom-nav__item--active' : ''
              }`.trim()}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => onNavigate(item.id)}
            >
              <Icon name={item.icon} />
              <span className="bottom-nav__label">{t(item.key)}</span>
            </button>
          );
        })}

        {/* Центральний слот — містить лейбл під FAB.
            Сама FAB-кнопка позиціонується абсолютно, поверх цього слоту. */}
        <div className="bottom-nav__center-slot">
          <span
            className={`bottom-nav__fab-label ${
              isFabActive ? 'bottom-nav__fab-label--active' : ''
            }`.trim()}
          >
            {t(FAB_ITEM.key)}
          </span>
        </div>

        {/* Права сторона: 2 пункти */}
        {SIDE_ITEMS.slice(2, 4).map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`bottom-nav__item ${
                isActive ? 'bottom-nav__item--active' : ''
              }`.trim()}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => onNavigate(item.id)}
            >
              <Icon name={item.icon} />
              <span className="bottom-nav__label">{t(item.key)}</span>
            </button>
          );
        })}
      </div>

      {/* Піднята центральна FAB-кнопка Асистента.
          Позиціонується абсолютно відносно .bottom-nav. */}
      <button
        type="button"
        className={`bottom-nav__fab ${
          isFabActive ? 'bottom-nav__fab--active' : ''
        }`.trim()}
        aria-current={isFabActive ? 'page' : undefined}
        aria-label={t(FAB_ITEM.key)}
        onClick={() => onNavigate(FAB_ITEM.id)}
      >
        <Icon name="sparkles" />
      </button>
    </nav>
  );
}

export default BottomNavigation;