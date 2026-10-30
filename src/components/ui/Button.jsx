import './Button.css';

/**
 * Кнопка BARLOG.
 *
 * @param {('primary'|'secondary')} [variant='primary'] — візуальний варіант
 * @param {('button'|'submit'|'reset')} [type='button'] — тип кнопки за замовчуванням 'button',
 *   щоб уникнути випадкової відправки форми
 */
function Button({
  variant = 'primary',
  type = 'button',
  disabled = false,
  onClick,
  children,
  className = '',
  ...rest
}) {
  const classes = ['btn', `btn--${variant}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  );
}

export default Button;