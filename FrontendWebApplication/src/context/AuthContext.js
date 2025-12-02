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
});

// PUBLIC_INTERFACE
export function AuthProvider({ children }) {
  /** Provides authentication and profile state to the application. */
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(false);
  const [health, setHealth] = useState("checking");

  // In mock mode, initialize a fake token if none exists
  useEffect(() => {
    if (isMockEnabled() && !tokenStore.get()) {
      tokenStore.set("mock-token");
      try {
        const existing = localStorage.getItem("mock_user_profile");
        if (!existing) {
          localStorage.setItem("mock_user_profile", JSON.stringify({ id: "u-1", username: "mockuser", email: "mock@example.com", role: "user" }));
        }
      } catch {}
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

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const res = await Api.login(email, password);
      await refreshProfile();
      return res;
    } finally {
      setLoading(false);
    }
  }, [refreshProfile]);

  const register = useCallback(async (username, email, password) => {
    setLoading(true);
    try {
      const res = await Api.register(username, email, password);
      // After register, try login automatically
      await Api.login(email, password);
      await refreshProfile();
      return res;
    } finally {
      setLoading(false);
    }
  }, [refreshProfile]);

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
      setLoading(false);
    }
  }, []);

  // Initialize: check health and profile
  useEffect(() => {
    let mounted = true;

    if (isMockEnabled()) {
      setHealth("ok");
      refreshProfile();
      return () => { mounted = false; };
    }

    Api.health()
      .then((status) => {
        if (mounted) setHealth(status === "ok" ? "ok" : "unavailable");
      })
      .catch(() => {
        if (mounted) setHealth("unavailable");
      });
    refreshProfile();
    return () => {
      mounted = false;
    };
  }, [refreshProfile]);

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
    }),
    [user, role, loading, health, login, register, logout, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
