import { useId } from 'react';
import './Input.css';

/**
 * Поле вводу BARLOG.
 *
 * @param {string} [label] — текст<label>
 * @param {string} [error] — повідомлення про помилку; якщо задано, поле позначається aria-invalid
 * @param {string} [id] — власний id; якщо не задано, генерується через useId()
 * Решта пропсів (type, value, defaultValue, onChange, placeholder, required, ...)
 * прокидуються у звичайний <input>, тож компонент працює і як controlled, і як uncontrolled.
 */
function Input({
  label,
  error,
  id,
  required = false,
  className = '',
  ...rest
}) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;
  const hasError = Boolean(error);

  return (
    <div className={`field ${className}`.trim()}>
      {label && (
        <label className="field__label" htmlFor={inputId}>
          {label}
          {required && (
            <span className="field__required" aria-hidden="true">*</span>
          )}
        </label>
      )}

      <input
        id={inputId}
        className={`field__input ${hasError ? 'field__input--error' : ''}`.trim()}
        required={required}
        aria-invalid={hasError || undefined}
        aria-describedby={hasError ? errorId : undefined}
        {...rest}
      />

      {hasError && (
        <p className="field__error" id={errorId} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default Input;