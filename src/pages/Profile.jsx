import './Profile.css';
import { useState } from 'react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import useLanguage from '../hooks/useLanguage';

const PROFILE_STORAGE_KEY = 'barlog-profile';

const DEFAULT_PROFILE = {
  displayName: '',
  role: '',
};

/**
 * Безпечно читає збережений профіль з localStorage.
 */
function loadProfile() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return DEFAULT_PROFILE;
  }
  try {
    const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return DEFAULT_PROFILE;
    return {
      displayName: typeof parsed.displayName === 'string' ? parsed.displayName : '',
      role: typeof parsed.role === 'string' ? parsed.role : '',
    };
  } catch (error) {
    console.warn('BARLOG: не вдалося прочитати профіль з localStorage', error);
    return DEFAULT_PROFILE;
  }
}

/**
 * Безпечно зберігає профіль у localStorage.
 */
function saveProfile(profile) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.warn('BARLOG: не вдалося зберегти профіль у localStorage', error);
  }
}

function BackIcon() {
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
      className="profile__back-icon"
    >
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

/**
 * Profile — локальний демо-профіль бармена.
 *
 * Два режими:
 *   - Перегляд: показує збережені ім'я та спеціалізацію + кнопку «Редагувати».
 *   - Редагування: форма з полями + кнопки «Зберегти» / «Скасувати».
 *
 * Збереження: localStorage під ключем 'barlog-profile'.
 * Валідація: ім'я не може бути порожнім.
 */
function Profile({ onNavigate }) {
  const { t } = useLanguage();
  const [savedProfile, setSavedProfile] = useState(loadProfile);
  const [displayName, setDisplayName] = useState(savedProfile.displayName);
  const [role, setRole] = useState(savedProfile.role);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = () => {
    setDisplayName(savedProfile.displayName);
    setRole(savedProfile.role);
    setError('');
    setIsEditing(true);
  };

  const handleSave = () => {
    const trimmedName = displayName.trim();
    if (!trimmedName) {
      setError(t('profile.nameRequired'));
      return;
    }
    const next = { displayName: trimmedName, role: role.trim() };
    setSavedProfile(next);
    saveProfile(next);
    setDisplayName(next.displayName);
    setRole(next.role);
    setError('');
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDisplayName(savedProfile.displayName);
    setRole(savedProfile.role);
    setError('');
    setIsEditing(false);
  };

  return (
    <main className="profile">
      <header className="profile__header">
        <Button
          variant="secondary"
          className="profile__back"
          onClick={() => onNavigate('library')}
          aria-label={t('profile.backToLibrary')}
        >
          <BackIcon />
          <span>{t('profile.backToLibrary')}</span>
        </Button>

        <p className="profile__eyebrow">{t('profile.eyebrow')}</p>
        <h1 className="profile__title">{t('profile.title')}</h1>
        <p className="profile__demo-notice">{t('profile.demoNotice')}</p>
      </header>

      {isEditing ? (
        <div className="profile__form">
          <Input
            label={t('profile.displayNameLabel')}
            placeholder={t('profile.displayNamePlaceholder')}
            value={displayName}
            onChange={(event) => {
              setDisplayName(event.target.value);
              if (error) setError('');
            }}
            error={error || undefined}
            required
          />
          <div className="profile__field-group">
            <Input
              label={t('profile.roleLabel')}
              placeholder={t('profile.rolePlaceholder')}
              value={role}
              onChange={(event) => setRole(event.target.value)}
            />
            <p className="profile__hint">{t('profile.roleHint')}</p>
          </div>
          <div className="profile__actions">
            <Button variant="primary" onClick={handleSave}>
              {t('profile.save')}
            </Button>
            <Button variant="secondary" onClick={handleCancel}>
              {t('profile.cancel')}
            </Button>
          </div>
        </div>
      ) : (
        <div className="profile__view">
          <div className="profile__field">
            <p className="profile__field-label">
              {t('profile.displayNameLabel')}
            </p>
            <p className="profile__field-value">
              {savedProfile.displayName || t('profile.notSet')}
            </p>
          </div>
          <div className="profile__field">
            <p className="profile__field-label">{t('profile.roleLabel')}</p>
            <p className="profile__field-value">
              {savedProfile.role || t('profile.notSet')}
            </p>
          </div>
          <Button variant="primary" onClick={handleEdit}>
            {t('profile.edit')}
          </Button>
        </div>
      )}
    </main>
  );
}

export default Profile;