import './Tag.css';

/**
 * Tag — компактна підписка для категорій та статусів.
 *
 * @param {('default'|'accent'|'muted')} [variant='default']
 * @param {React.ReactNode} children — видима мітка
 */
function Tag({ variant = 'default', children, className = '' }) {
  const classes = ['tag', `tag--${variant}`, className]
    .filter(Boolean)
    .join(' ');

  return <span className={classes}>{children}</span>;
}

export default Tag;