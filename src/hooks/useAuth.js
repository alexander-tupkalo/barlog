import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * useAuth — хук доступу до контексту авторизації.
 *
 * Повертає:
 *   { user, loading, error, isAuthed,
 *     signIn, signUp, signOut, signInWithOAuth, clearError }
 *
 * Кидає помилку, якщо викликаний поза AuthProvider.
 */
function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error('useAuth повинен використовуватись усередині AuthProvider');
  }
  return ctx;
}

export default useAuth;