//
//
// Centralized API client with JWT handling and environment-driven base URL
//
// Provides resilient base URL resolution and clearer network error messages.
//

// PUBLIC_INTERFACE
export function getApiBase() {
  /** Returns the API base URL from environment variables with a sensible default. */
  const envBase =
    process.env.REACT_APP_API_BASE ||
    process.env.REACT_APP_BACKEND_URL ||
    "";

  if (envBase) {
    return envBase;
  }

  // Fallback to same-origin + /api when no env variables are provided.
  // Guard for test environments where window may be undefined.
  try {
    if (typeof window !== "undefined" && window.location?.origin) {
      return `${window.location.origin}/api`;
    }
  } catch {
    // ignore
  }

  // Last resort: relative /api (older behavior)
  return "/api";
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
  /**
   * Fetch wrapper that attaches base URL, JSON headers, optional auth token,
   * and handles JSON parsing with graceful fallback.
   */
  const base = (getApiBase() || "").replace(/\/+$/, "");
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
    throw error;
  }
  return payload;
}

// PUBLIC_INTERFACE
export const Api = {
  /** Health check for preview readiness; always resolves to "ok" or "unavailable". */
  health: async () => {
    try {
      await apiFetch("/health");
      return "ok";
    } catch {
      return "unavailable";
    }
  },

  /** Auth endpoints */
  login: async (email, password) => {
    const res = await apiFetch("/auth/login", {
      method: "POST",
      body: { email, password },
    });
    if (res?.accessToken) tokenStore.set(res.accessToken);
    return res;
  },
  register: (username, email, password) =>
    apiFetch("/auth/register", {
      method: "POST",
      body: { username, email, password },
    }),
  logout: () =>
    apiFetch("/auth/logout", { method: "POST", auth: true }).finally(() =>
      tokenStore.clear()
    ),

  /** Profile endpoints */
  getProfile: () => apiFetch("/user/profile", { auth: true }),
  updateProfile: (data) =>
    apiFetch("/user/profile", { method: "PUT", body: data, auth: true }),

  /** Categories */
  getCategories: () => apiFetch("/categories"),

  /** Recipes */
  listRecipes: (params = {}, options = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") qs.append(k, v);
    });
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    const { signal } = options || {};
    return apiFetch(`/recipes${suffix}`, { signal });
  },
  getRecipe: (id, options = {}) =>
    apiFetch(`/recipes/${encodeURIComponent(id)}`, options),
  createRecipe: (recipe) =>
    apiFetch("/recipes", { method: "POST", body: recipe, auth: true }),
  updateRecipe: (id, recipe) =>
    apiFetch(`/recipes/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: recipe,
      auth: true,
    }),
  deleteRecipe: (id) =>
    apiFetch(`/recipes/${encodeURIComponent(id)}`, {
      method: "DELETE",
      auth: true,
    }),

  /** Feedback */
  submitFeedback: (feedback) =>
    apiFetch("/feedback", { method: "POST", body: feedback, auth: true }),
  listFeedback: (options = {}) => apiFetch("/feedback", { auth: true, ...options }),
};
