import './FavoriteToggle.css';

/* Заповнена зірка для активного стану. */
function StarIconFilled() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className="favorite-toggle__icon"
    >
      <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  );
}

/* Контурна зірка для неактивного стану. */
function StarIconOutline() {
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
      className="favorite-toggle__icon"
    >
      <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  );
}

/**
 * FavoriteToggle — кнопка-зірка для додавання коктейлю в обране.
 *
 * @param {boolean} isFavorite — чи додано коктейль в обране
 * @param {Function} onToggle — колбек при кліку
 * @param {string} ariaLabel — локалізована назва коктейлю для aria-label
 * @param {string} size — 'sm' (на картці) або 'md' (в деталях)
 * @param {string} className — додатковий клас (для позиціювання)
 */
function FavoriteToggle({
  isFavorite,
  onToggle,
  ariaLabel,
  size = 'sm',
  className = '',
}) {
  const classes = ['favorite-toggle', `favorite-toggle--${size}`, className]
    .filter(Boolean)
    .join(' ');

  // aria-label будується динамічно: "Додати Negroni в обране" або
  // "Видалити Negroni з обраного". Це дає скринрідерам повний контекст.
  const label = isFavorite
    ? ariaLabel
    : ariaLabel;

  return (
    <button
      type="button"
      className={classes}
      aria-pressed={isFavorite}
      aria-label={label}
      onClick={(event) => {
        // Критично: зупиняємо подію, щоб клік по зірці не відкривав деталі
        // (на картці коктейлю вся поверхня — кнопка).
        event.stopPropagation();
        onToggle();
      }}
    >
      {isFavorite ? <StarIconFilled /> : <StarIconOutline />}
    </button>
  );
}

export default FavoriteToggle;