import { MockApi, isMockEnabled as mockFlag } from "../mocks/mockApi";
//
// Centralized API client with JWT handling and environment-driven base URL
//
// Provides resilient base URL resolution and clearer network error messages.
//

/**
 * Normalize a base URL string:
 * - trims trailing slashes
 * - ensures a path exists when origin-only URL is provided
 * - optionally overrides/forces a versioned path (e.g. /api/v1)
 * - prefers relative path when target origin equals current window origin
 */
function normalizeBase(raw, forceVersionedPath = "") {
  try {
    const url = new URL(raw);
    let pathname = url.pathname || "/";
    // If force path provided, use it; else default /api when naked origin
    if (forceVersionedPath) {
      pathname = forceVersionedPath;
    } else if (pathname === "/") {
      pathname = "/api";
    }
    // Prefer returning relative path for same-origin to avoid CORS/preview issues
    try {
      if (typeof window !== "undefined" && window.location?.origin && url.origin === window.location.origin) {
        return pathname.replace(/\/*$/, "");
      }
    } catch {
      // ignore window access errors
    }
    return `${url.origin}${pathname}`.replace(/\/*$/, "");
  } catch {
    // relative path like "/api" or "api/v1"
    let base = (raw || "").trim();
    if (!base) return "/api";
    if (!base.startsWith("/")) base = `/${base}`;
    // Apply force path if requested
    if (forceVersionedPath) base = forceVersionedPath.startsWith("/") ? forceVersionedPath : `/${forceVersionedPath}`;
    return base.replace(/\/*$/, "");
  }
}

/** Detect if mock mode is active */
export function isMockEnabled() {
  return mockFlag();
}

// PUBLIC_INTERFACE
export function getApiBase() {
  /**
   * Resolve API base from env with precedence and optional version override.
   * Precedence:
   * 1) REACT_APP_API_BASE
   * 2) REACT_APP_BACKEND_URL
   * 3) same-origin + '/api'
   * If REACT_APP_API_VERSIONED_PATH is set (e.g., '/api/v1'), enforce it.
   */
  const forceVersionedPath =
    (process.env.REACT_APP_API_VERSIONED_PATH || "").trim();

  const candidate =
    process.env.REACT_APP_API_BASE ||
    process.env.REACT_APP_BACKEND_URL ||
    "";

  if (candidate) {
    return normalizeBase(candidate, forceVersionedPath);
  }

  // Fallback to same-origin + /api when no env variables are provided.
  try {
    if (typeof window !== "undefined" && window.location?.origin) {
      // Prefer a relative path so that proxies/frames keep requests same-origin.
      const fallback = `/api`;
      return normalizeBase(fallback, forceVersionedPath);
    }
  } catch {
    // ignore
  }

  // Last resort: relative /api
  return normalizeBase("/api", forceVersionedPath);
}

let inMemoryToken = null;

/**
 * Load token from localStorage on module load to persist sessions across refresh.
 */
(function initToken() {
  try {
    const saved = localStorage.getItem("auth_token");
    if (saved) inMemoryToken = saved;
  } catch {
    // ignore storage access errors
  }
})();

/**
 * Save/clear token to/from memory and localStorage.
 */
export const tokenStore = {
  // PUBLIC_INTERFACE
  set(token) {
    /** Sets the JWT token in memory and persists it to localStorage. */
    inMemoryToken = token;
    try {
      if (token) {
        localStorage.setItem("auth_token", token);
      } else {
        localStorage.removeItem("auth_token");
      }
    } catch {
      // ignore storage issues
    }
  },
  // PUBLIC_INTERFACE
  get() {
    /** Returns the current JWT token from memory. */
    return inMemoryToken;
  },
  // PUBLIC_INTERFACE
  clear() {
    /** Clears the JWT token from memory and localStorage. */
    inMemoryToken = null;
    try {
      localStorage.removeItem("auth_token");
    } catch {
      // ignore
    }
  },
};

// PUBLIC_INTERFACE
export async function apiFetch(
  path,
  { method = "GET", body, headers = {}, auth = false, signal } = {}
) {
  // In mock mode, apiFetch should generally not be invoked; protect accidental use in Diagnostics.
  if (isMockEnabled()) {
    // Provide a clear error to any direct apiFetch calls in mock mode.
    const e = new Error("apiFetch disabled in mock mode");
    e.status = 0;
    e.url = path;
    throw e;
  }
  /**
   * Fetch wrapper that attaches base URL, JSON headers, optional auth token,
   * and handles JSON parsing with graceful fallback.
   */
  const base = (getApiBase() || "").replace(/\/*$/, "");
  const url = `${base}${path.startsWith("/") ? "" : "/"}${path}`;

  const finalHeaders = {
    Accept: "application/json",
    ...(body ? { "Content-Type": "application/json" } : {}),
    ...headers,
  };
  if (auth && tokenStore.get()) {
    finalHeaders["Authorization"] = `Bearer ${tokenStore.get()}`;
  }

  let response;
  try {
    response = await fetch(url, {
      method,
      headers: finalHeaders,
      body: body ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (networkErr) {
    // Provide actionable network error with the attempted URL
    const e = new Error(
      `Network error while requesting ${url}: ${networkErr?.message || "Failed to fetch"}`
    );
    e.cause = networkErr;
    e.status = 0;
    throw e;
  }

  // Try parsing JSON; on non-JSON, return text
  let payload = null;
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }
  } else {
    try {
      payload = await response.text();
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    const error = new Error(
      (payload && payload.message) || `Request to ${url} failed with status ${response.status}`
    );
    error.status = response.status;
    error.payload = payload;
    error.url = url;
    throw error;
  }
  return payload;
}

// PUBLIC_INTERFACE
export const Api = {
  /** Health check for preview readiness */
  health: async () => {
    if (mockFlag()) return "ok";
    try {
      await apiFetch("/health");
      return "ok";
    } catch {
      return "unavailable";
    }
  },

  /** Auth endpoints */
  login: async (email, password) => {
    if (mockFlag()) {
      const res = await MockApi.login(email, password);
      if (res?.accessToken) tokenStore.set(res.accessToken);
      // Save mock user profile for later getProfile
      try { localStorage.setItem("mock_user_profile", JSON.stringify(res.user)); } catch {}
      return res;
    }
    const res = await apiFetch("/auth/login", {
      method: "POST",
      body: { email, password },
    });
    if (res?.accessToken) tokenStore.set(res.accessToken);
    return res;
  },
  register: (username, email, password) => {
    if (mockFlag()) return MockApi.register(username, email, password);
    return apiFetch("/auth/register", {
      method: "POST",
      body: { username, email, password },
    });
  },
  logout: () => {
    if (mockFlag()) {
      tokenStore.clear();
      return MockApi.logout();
    }
    return apiFetch("/auth/logout", { method: "POST", auth: true }).finally(() =>
      tokenStore.clear()
    );
  },

  /** Profile endpoints */
  getProfile: () => {
    if (mockFlag()) return MockApi.getProfile();
    return apiFetch("/user/profile", { auth: true });
  },
  updateProfile: (data) => {
    if (mockFlag()) return MockApi.updateProfile(data);
    return apiFetch("/user/profile", { method: "PUT", body: data, auth: true });
  },

  /** Categories */
  getCategories: () => {
    if (mockFlag()) return MockApi.getCategories();
    return apiFetch("/categories");
  },

  /** Recipes */
  listRecipes: (params = {}, options = {}) => {
    if (mockFlag()) return MockApi.listRecipes(params);
    const qs = new URLSearchParams();
    // Pass through all provided params including search 'q' unchanged
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") {
        qs.append(k, v);
      }
    });
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    const { signal } = options || {};
    return apiFetch(`/recipes${suffix}`, { signal });
  },
  getRecipe: (id, options = {}) => {
    if (mockFlag()) return MockApi.getRecipe(id);
    return apiFetch(`/recipes/${encodeURIComponent(id)}`, options);
  },
  createRecipe: (recipe) => {
    if (mockFlag()) return MockApi.createRecipe(recipe);
    return apiFetch("/recipes", { method: "POST", body: recipe, auth: true });
  },
  updateRecipe: (id, recipe) => {
    if (mockFlag()) return MockApi.updateRecipe(id, recipe);
    return apiFetch(`/recipes/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: recipe,
      auth: true,
    });
  },
  deleteRecipe: (id) => {
    if (mockFlag()) return MockApi.deleteRecipe(id);
    return apiFetch(`/recipes/${encodeURIComponent(id)}`, {
      method: "DELETE",
      auth: true,
    });
  },

  /** Feedback */
  submitFeedback: (feedback) => {
    if (mockFlag()) return MockApi.submitFeedback(feedback);
    return apiFetch("/feedback", { method: "POST", body: feedback, auth: true });
  },
  listFeedback: (options = {}) => {
    if (mockFlag()) return MockApi.listFeedback();
    return apiFetch("/feedback", { auth: true, ...options });
  },

  /** Favorites (graceful no-op if backend lacks endpoints; mock uses localStorage) */
  getFavorites: async () => {
    if (mockFlag()) return MockApi.getFavorites();
    try {
      return await apiFetch("/user/favorites", { auth: true });
    } catch (_e) {
      // Graceful fallback to localStorage when endpoint not available
      try {
        const raw = localStorage.getItem("favorites");
        const ids = raw ? JSON.parse(raw) : [];
        return Array.isArray(ids) ? ids : [];
      } catch {
        return [];
      }
    }
  },
  addFavorite: async (recipeId) => {
    if (mockFlag()) return MockApi.addFavorite(recipeId);
    try {
      await apiFetch("/user/favorites", { method: "POST", body: { recipeId }, auth: true });
      return { ok: true };
    } catch (_e) {
      // fallback no-op
      return { ok: false, fallback: true };
    }
  },
  removeFavorite: async (recipeId) => {
    if (mockFlag()) return MockApi.removeFavorite(recipeId);
    try {
      await apiFetch(`/user/favorites/${encodeURIComponent(recipeId)}`, { method: "DELETE", auth: true });
      return { ok: true };
    } catch (_e) {
      // fallback no-op
      return { ok: false, fallback: true };
    }
  },
};
