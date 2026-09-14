/**
 * Unified auth store — single source of truth.
 *
 * Previously there were two stores (authStore.js and useAuthStore.js) with the
 * same persist key 'auth-storage'. That caused token sync issues because
 * api.js imported authStore.js while pages imported useAuthStore.js.
 *
 * Resolution:
 *  - This file is the canonical store used by ALL pages and components.
 *  - authStore.js now re-exports this store for backward compatibility so
 *    api.js (which imports authStore.js) continues to work without changes.
 *  - Both files share the same Zustand store instance via this module.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user:            null,
      token:           null,
      isAuthenticated: false,

      // ── Actions ────────────────────────────────────────────────────────────

      /** Called by Login page */
      login: (userData, token) => {
        set({ user: userData, token, isAuthenticated: true });
      },

      /**
       * Alias used by api.js interceptor (legacy authStore.js compat).
       * Identical to login().
       */
      setAuth: (userData, token) => {
        set({ user: userData, token, isAuthenticated: true });
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },

      setUser: (userData) => {
        set({ user: userData });
      },

      /** Merge partial updates into user object (e.g. after subscription change) */
      updateUser: (updates) => {
        const current = get().user;
        if (current) {
          set({ user: { ...current, ...updates } });
        }
      },

      // ── Selectors ──────────────────────────────────────────────────────────
      getToken:  () => get().token,
      getUser:   () => get().user,
      isLoggedIn: () => get().isAuthenticated,
    }),
    {
      name: 'auth-storage',
      // Only persist what we need; avoids stale computed state in storage
      partialize: (state) => ({
        user:            state.user,
        token:           state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
