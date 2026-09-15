import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

/**
 * ProtectedRoute — waits for Zustand persist rehydration before deciding.
 *
 * Without this, Zustand's persist middleware rehydrates localStorage async,
 * so isAuthenticated is `false` on the very first render even for logged-in
 * users, causing an immediate redirect to /login.
 */
const ProtectedRoute = ({ children }) => {
  const isAuthenticated                = useAuthStore((state) => state.isAuthenticated);
  const [hydrated, setHydrated]        = useState(false);

  useEffect(() => {
    // useAuthStore.persist.hasHydrated() returns true once localStorage is read.
    // If it's already done (e.g. hot reload), skip the subscription.
    const alreadyHydrated = useAuthStore.persist?.hasHydrated?.();
    if (alreadyHydrated) {
      setHydrated(true);
      return;
    }

    // Subscribe to the onFinishHydration event
    const unsub = useAuthStore.persist?.onFinishHydration?.(() => {
      setHydrated(true);
    });

    // Fallback: if persist API is unavailable, assume hydrated after 1 frame
    const timer = setTimeout(() => setHydrated(true), 50);

    return () => {
      unsub?.();
      clearTimeout(timer);
    };
  }, []);

  // Show nothing while rehydrating — avoids flash redirect to /login
  if (!hydrated) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
