import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { Api, tokenStore, isMockEnabled } from "../api/client";

// PUBLIC_INTERFACE
export const AuthContext = createContext({
  /** Auth state and actions for the app */
  isAuthenticated: false,
  user: null,
  role: "user",
  loading: false,
  health: "checking",
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  refreshProfile: async () => {},
  // Favorites public API
  favorites: [],
  addFavorite: async (_id) => {},
  removeFavorite: async (_id) => {},
  toggleFavorite: async (_id) => {},
  isFavorite: (_id) => false,
  refreshFavorites: async () => {},
});

// PUBLIC_INTERFACE
export function AuthProvider({ children }) {
  /** Provides authentication, profile state, and favorites to the application. */
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(false);
  const [health, setHealth] = useState("checking");
  const [favorites, setFavorites] = useState([]);

  // In mock mode, initialize a fake token if none exists
  useEffect(() => {
    if (isMockEnabled() && !tokenStore.get()) {
      tokenStore.set("mock-token");
      try {
        const existing = localStorage.getItem("mock_user_profile");
        if (!existing) {
          localStorage.setItem(
            "mock_user_profile",
            JSON.stringify({ id: "u-1", username: "mockuser", email: "mock@example.com", role: "user" })
          );
        }
      } catch {
        // ignore storage errors
      }
    }
  }, []);

  const isAuthenticated = !!tokenStore.get();

  const refreshProfile = useCallback(async () => {
    if (!tokenStore.get()) {
      setUser(null);
      setRole("user");
      return null;
    }
    setLoading(true);
    try {
      const profile = await Api.getProfile();
      setUser(profile);
      setRole(profile?.role || "user");
      return profile;
    } catch {
      // token may be invalid; clear it softly
      tokenStore.clear();
      setUser(null);
      setRole("user");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // localStorage helpers for mock/local fallback
  const readLocalFavorites = () => {
    try {
      const raw = localStorage.getItem("favorites");
      const ids = raw ? JSON.parse(raw) : [];
      return Array.isArray(ids) ? ids.map(String) : [];
    } catch {
      return [];
    }
  };
  const writeLocalFavorites = (ids) => {
    try {
      localStorage.setItem("favorites", JSON.stringify(Array.isArray(ids) ? ids : []));
    } catch {
      // ignore
    }
  };

  // PUBLIC_INTERFACE
  const refreshFavorites = useCallback(async () => {
    /** Load favorites from backend (if available) or localStorage. */
    if (!tokenStore.get()) {
      setFavorites([]);
      return [];
    }
    try {
      const ids = await Api.getFavorites();
      const safe = Array.isArray(ids) ? ids.map(String) : [];
      setFavorites(safe);
      writeLocalFavorites(safe);
      return safe;
    } catch {
      const local = readLocalFavorites();
      setFavorites(local);
      return local;
    }
  }, []);

  // PUBLIC_INTERFACE
  const addFavorite = useCallback(async (id) => {
    /** Add a recipe ID to favorites and persist appropriately. */
    const rid = String(id);
    setFavorites((prev) => {
      const next = prev.includes(rid) ? prev : [...prev, rid];
      writeLocalFavorites(next);
      return next;
    });
    try {
      await Api.addFavorite(rid);
    } catch {
      // ignore backend errors; local persisted
    }
  }, []);

  // PUBLIC_INTERFACE
  const removeFavorite = useCallback(async (id) => {
    /** Remove a recipe ID from favorites and persist appropriately. */
    const rid = String(id);
    setFavorites((prev) => {
      const next = prev.filter((x) => x !== rid);
      writeLocalFavorites(next);
      return next;
    });
    try {
      await Api.removeFavorite(rid);
    } catch {
      // ignore backend errors; local persisted
    }
  }, []);

  // PUBLIC_INTERFACE
  const toggleFavorite = useCallback(
    async (id) => {
      /** Toggle a recipe ID in favorites. */
      const rid = String(id);
      setFavorites((prev) => {
        const exists = prev.includes(rid);
        const next = exists ? prev.filter((x) => x !== rid) : [...prev, rid];
        writeLocalFavorites(next);
        return next;
      });
      try {
        if (favorites.includes(rid)) {
          await Api.removeFavorite(rid);
        } else {
          await Api.addFavorite(rid);
        }
      } catch {
        // ignore backend errors; local persisted
      }
    },
    [favorites]
  );

  // PUBLIC_INTERFACE
  const isFavorite = useCallback(
    (id) => {
      /** Returns true if the given recipe ID is marked as favorite. */
      return favorites.includes(String(id));
    },
    [favorites]
  );

  const login = useCallback(
    async (email, password) => {
      setLoading(true);
      try {
        const res = await Api.login(email, password);
        await refreshProfile();
        await refreshFavorites();
        return res;
      } finally {
        setLoading(false);
      }
    },
    [refreshProfile, refreshFavorites]
  );

  const register = useCallback(
    async (username, email, password) => {
      setLoading(true);
      try {
        const res = await Api.register(username, email, password);
        // After register, try login automatically
        await Api.login(email, password);
        await refreshProfile();
        await refreshFavorites();
        return res;
      } finally {
        setLoading(false);
      }
    },
    [refreshProfile, refreshFavorites]
  );

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await Api.logout();
    } catch {
      // ignore errors, still clear token
    } finally {
      tokenStore.clear();
      setUser(null);
      setRole("user");
      setFavorites([]);
      setLoading(false);
    }
  }, []);

  // Initialize: check health and profile
  useEffect(() => {
    let mounted = true;

    if (isMockEnabled()) {
      setHealth("ok");
      refreshProfile();
      refreshFavorites();
      return () => {
        mounted = false;
      };
    }

    Api.health()
      .then((status) => {
        if (mounted) setHealth(status === "ok" ? "ok" : "unavailable");
      })
      .catch(() => {
        if (mounted) setHealth("unavailable");
      });
    refreshProfile();
    refreshFavorites();
    return () => {
      mounted = false;
    };
  }, [refreshProfile, refreshFavorites]);

  const value = useMemo(
    () => ({
      isAuthenticated: !!tokenStore.get(),
      user,
      role,
      loading,
      health,
      login,
      register,
      logout,
      refreshProfile,
      favorites,
      addFavorite,
      removeFavorite,
      toggleFavorite,
      isFavorite,
      refreshFavorites,
    }),
    [
      user,
      role,
      loading,
      health,
      login,
      register,
      logout,
      refreshProfile,
      favorites,
      addFavorite,
      removeFavorite,
      toggleFavorite,
      isFavorite,
      refreshFavorites,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
