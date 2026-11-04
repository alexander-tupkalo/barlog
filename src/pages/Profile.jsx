import './Profile.css';
import { useState, useEffect } from 'react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import SubscriptionBadge from '../components/subscription/SubscriptionBadge';
import useLanguage from '../hooks/useLanguage';
import useSubscription from '../hooks/useSubscription';
import useAuth from '../hooks/useAuth';
import {
  loadProfile as loadProfileFromPB,
  saveProfile as saveProfileToPB,
  migrateGuestProfile,
} from '../utils/profileRepository';

const PROFILE_STORAGE_KEY = 'barlog-profile';

const DEFAULT_PROFILE = {
  displayName: '',
  role: '',
};

/* ---- Локальные функции для гостей (localStorage) ---- */
function loadLocalProfile() {
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

function saveLocalProfile(profile) {
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

function UserIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className="profile__avatar-icon"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  );
}

function ChevronIcon() {
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
      className="profile__chevron"
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

function SignOutIcon() {
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
      className="profile__signout-icon"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

/**
 * Profile — dashboard акаунту та підписки.
 *
 * Состояние UI зависит от авторизации:
 *   - Гість: локальный демо-профиль бармена через localStorage.
 *   - Залогінений: профиль бармена из PB (синхронизация между устройствами).
 *
 * При первом входе гостевой профиль мигрируется в PB (если в PB пусто).
 */
function Profile({ onNavigate }) {
  const { t } = useLanguage();
  const { plan } = useSubscription();
  const { user, isAuthed, signOut } = useAuth();

  const [savedProfile, setSavedProfile] = useState(loadLocalProfile);
  const [displayName, setDisplayName] = useState(savedProfile.displayName);
  const [role, setRole] = useState(savedProfile.role);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);

  /* ---------- Загрузка профиля при смене user ---------- */
  useEffect(() => {
    let cancelled = false;

    async function loadProfileData() {
      if (!user) {
        // Гость → localStorage
        const local = loadLocalProfile();
        if (cancelled) return;
        setSavedProfile(local);
        setDisplayName(local.displayName);
        setRole(local.role);
        setProfileLoaded(true);
        return;
      }

      // Залогиненный → PB
      // Сначала мигрируем гостевой профиль, если он есть
      const guestProfile = loadLocalProfile();
      if (guestProfile.displayName || guestProfile.role) {
        await migrateGuestProfile(guestProfile);
        // Очищаем гостевой профиль в localStorage после миграции
        saveLocalProfile(DEFAULT_PROFILE);
      }

      if (cancelled) return;
      try {
        const pbProfile = await loadProfileFromPB();
        if (cancelled) return;
        setSavedProfile(pbProfile);
        setDisplayName(pbProfile.displayName);
        setRole(pbProfile.role);
      } catch (err) {
        console.warn('BARLOG: помилка завантаження профілю', err);
      } finally {
        if (!cancelled) setProfileLoaded(true);
      }
    }

    setProfileLoaded(false);
    loadProfileData();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleEdit = () => {
    setDisplayName(savedProfile.displayName);
    setRole(savedProfile.role);
    setError('');
    setIsEditing(true);
  };

  const handleSave = async () => {
    const trimmedName = displayName.trim();
    if (!trimmedName) {
      setError(t('profile.nameRequired'));
      return;
    }

    const next = { displayName: trimmedName, role: role.trim() };

    if (user) {
      // Залогиненный → PB
      setIsSaving(true);
      try {
        const saved = await saveProfileToPB(next);
        setSavedProfile(saved);
        setDisplayName(saved.displayName);
        setRole(saved.role);
        setError('');
        setIsEditing(false);
      } catch (err) {
        console.warn('BARLOG: помилка збереження профілю', err);
        setError(t('profile.errorSave') || 'Не вдалося зберегти');
      } finally {
        setIsSaving(false);
      }
    } else {
      // Гость → localStorage
      setSavedProfile(next);
      saveLocalProfile(next);
      setDisplayName(next.displayName);
      setRole(next.role);
      setError('');
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setDisplayName(savedProfile.displayName);
    setRole(savedProfile.role);
    setError('');
    setIsEditing(false);
  };

  const handleSignOut = () => {
    signOut();
    onNavigate('home');
  };

  // Отображаемое имя:
  // - Залогиненный: приоритет — savedProfile.displayName, затем user.name, затем часть email
  // - Гость: savedProfile.displayName или fallback
  const displayNameOrFallback = isAuthed
    ? (savedProfile.displayName || user?.name || user?.email?.split('@')[0] || t('profile.registeredName'))
    : (savedProfile.displayName || t('profile.guestName'));

  const accountStatus = isAuthed
    ? t('profile.statusRegistered')
    : t('profile.statusGuest');

  const initials = isAuthed
    ? (user?.name || user?.email || '?')
        .split(/[\s@.]+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('')
    : null;

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
      </header>

      {/* ---- Шапка акаунту ---- */}
      <section className="profile__account-card">
        <div className="profile__avatar" aria-hidden="true">
          {isAuthed && initials ? (
            <span className="profile__avatar-initials">{initials}</span>
          ) : (
            <UserIcon />
          )}
        </div>
        <div className="profile__account-info">
          <h1 className="profile__name">{displayNameOrFallback}</h1>
          {isAuthed && user?.email && (
            <p className="profile__email">{user.email}</p>
          )}
          {savedProfile.role && (
            <p className="profile__role">{savedProfile.role}</p>
          )}
          <p className="profile__status">{accountStatus}</p>
        </div>
        {isAuthed && (
          <button
            type="button"
            className="profile__signout-btn"
            onClick={handleSignOut}
            aria-label={t('auth.signOut')}
            title={t('auth.signOut')}
          >
            <SignOutIcon />
          </button>
        )}
      </section>

      {/* ---- Блок підписки ---- */}
      <section className="profile__section">
        <div className="profile__section-head">
          <h2 className="profile__section-title">
            {t('profile.subscriptionTitle')}
          </h2>
          <SubscriptionBadge plan={plan} size="md" />
        </div>
        <p className="profile__section-text">
          {plan === 'pro'
            ? t('profile.proDescription')
            : t('profile.freeDescription')}
        </p>
        <Button
          variant={plan === 'pro' ? 'secondary' : 'primary'}
          onClick={() => onNavigate('subscription')}
        >
          {t('profile.manageSubscription')}
        </Button>
      </section>

      {/* ---- Локальний профіль бармена ---- */}
      <section className="profile__section">
        <h2 className="profile__section-title">
          {t('profile.bartenderSectionTitle')}
        </h2>
        <p className="profile__section-text">{t('profile.demoNotice')}</p>

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
              disabled={isSaving}
            />
            <div className="profile__field-group">
              <Input
                label={t('profile.roleLabel')}
                placeholder={t('profile.rolePlaceholder')}
                value={role}
                onChange={(event) => setRole(event.target.value)}
                disabled={isSaving}
              />
              <p className="profile__hint">{t('profile.roleHint')}</p>
            </div>
            <div className="profile__actions">
              <Button variant="primary" onClick={handleSave} disabled={isSaving}>
                {isSaving ? t('profile.saving') : t('profile.save')}
              </Button>
              <Button variant="secondary" onClick={handleCancel} disabled={isSaving}>
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
                {profileLoaded
                  ? (savedProfile.displayName || t('profile.notSet'))
                  : t('profile.loading') || '…'}
              </p>
            </div>
            <div className="profile__field">
              <p className="profile__field-label">{t('profile.roleLabel')}</p>
              <p className="profile__field-value">
                {profileLoaded
                  ? (savedProfile.role || t('profile.notSet'))
                  : '…'}
              </p>
            </div>
            <Button variant="secondary" onClick={handleEdit}>
              {t('profile.edit')}
            </Button>
          </div>
        )}
      </section>

      {/* ---- Швидкий доступ ---- */}
      <section className="profile__section">
        <h2 className="profile__section-title">
          {t('profile.quickLinksTitle')}
        </h2>
        <ul className="profile__links">
          <li>
            <button
              type="button"
              className="profile__link"
              onClick={() => onNavigate('mylab')}
            >
              <span className="profile__link-text">
                {t('profile.openMylab')}
              </span>
              <ChevronIcon />
            </button>
          </li>
          <li>
            <button
              type="button"
              className="profile__link"
              onClick={() => onNavigate('prep')}
            >
              <span className="profile__link-text">
                {t('profile.openPrep')}
              </span>
              <ChevronIcon />
            </button>
          </li>
          <li>
            <button
              type="button"
              className="profile__link"
              onClick={() => onNavigate('settings')}
            >
              <span className="profile__link-text">
                {t('profile.openSettings')}
              </span>
              <ChevronIcon />
            </button>
          </li>
        </ul>
      </section>

      {/* ---- CTA для входу (тільки для гостей) ---- */}
      {!isAuthed && (
        <section className="profile__sign-in-cta">
          <h2 className="profile__section-title">
            {t('profile.signInPromptTitle')}
          </h2>
          <p className="profile__section-text">
            {t('profile.signInPromptDescription')}
          </p>
          <div className="profile__sign-in-actions">
            <Button variant="primary" onClick={() => onNavigate('login')}>
              {t('profile.signInAction')}
            </Button>
            <Button
              variant="secondary"
              onClick={() => onNavigate('register')}
            >
              {t('profile.signUpAction')}
            </Button>
          </div>
        </section>
      )}
    </main>
  );
}

export default Profile;