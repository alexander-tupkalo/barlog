import './EmptyState.css';
import Button from './Button';

/**
 * EmptyState — спокійний блок-заглушка для екранів без контенту.
 *
 * @param {string} title — заголовок обов'язковий
 * @param {string} [description] — опис, необов'язковий
 * @param {string} [actionLabel] — текст кнопки; кнопка рендериться лише якщо задані й actionLabel, і onAction
 * @param {Function} [onAction] — обробник кліку
 * @param {string} [className] — додатковий клас для розширення
 */
function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) {
  const hasAction = Boolean(actionLabel) && typeof onAction === 'function';

  return (
    <div className={`empty-state ${className}`.trim()}>
      <h2 className="empty-state__title">{title}</h2>

      {description && (
        <p className="empty-state__description">{description}</p>
      )}

      {hasAction && (
        <div className="empty-state__action">
          <Button variant="primary" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}

export default EmptyState;