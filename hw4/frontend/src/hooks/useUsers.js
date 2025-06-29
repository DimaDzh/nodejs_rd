import { useState, useCallback, useEffect } from 'react';
import { fetchUsers, createUser } from '../api/users.js';

/**
 * Реактовий data-layer для users.
 * Повертає стани та методи `refresh` і `add`.
 */
export function useUsers() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  /* ---------- load ---------- */
  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setUsers(await fetchUsers());
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ---------- add ---------- */
  const add = useCallback(async (user) => {
    try {
      setLoading(true);
      const created = await createUser(user);

      // оптимістично додаємо в кеш (без ще одного GET)
      setUsers(prev => [...prev, created]);
      return created;
    } catch (e) {
      setError(e);
      throw e;              // пробросимо, щоб форма могла показати toast
    } finally {
      setLoading(false);
    }
  }, []);

  /* ---------- init on mount ---------- */
  useEffect(() => { void load(); }, [load]);

  return { users, loading, error, refresh: load, add };
}