//
//
// Mock API implementation for no-backend preview mode.
// This module mirrors src/api/client.js Api surface where required by the UI.
//
import { getMockRecipeById, getMockRecipes, mockCategories } from "./data";

// Simulate latency to better reflect UX without network
const delay = (ms) => new Promise((res) => setTimeout(res, ms));
const maybeDelay = async () => {
  const rand = Math.random();
  const ms = 80 + Math.round(rand * 220);
  await delay(ms);
};

// PUBLIC_INTERFACE
export const MockApi = {
  /** Health check is neutralized in mock mode; always ok. */
  health: async () => {
    await maybeDelay();
    return "ok";
  },

  /** Auth endpoints - fake token and user */
  login: async (email, _password) => {
    await maybeDelay();
    // Save performed by tokenStore in caller; here we return a fake token.
    return {
      accessToken: "mock-token",
      expiresIn: 3600,
      user: { id: "u-1", username: email.split("@")[0], email, role: "user" },
    };
  },
  register: async (username, email, _password) => {
    await maybeDelay();
    return {
      id: "u-1",
      username,
      email,
      role: "user",
      createdAt: new Date().toISOString(),
    };
  },
  logout: async () => {
    await maybeDelay();
    return { ok: true };
  },

  /** Profile endpoints: return/update local mock user object */
  getProfile: async () => {
    await maybeDelay();
    try {
      const raw = localStorage.getItem("mock_user_profile");
      if (raw) return JSON.parse(raw);
    } catch {}
    // default mock user
    return {
      id: "u-1",
      username: "mockuser",
      email: "mock@example.com",
      role: "user",
    };
  },
  updateProfile: async function (data) {
    await maybeDelay();
    // avoid using this in arrow context; read from localStorage explicitly
    let current = null;
    try {
      const raw = localStorage.getItem("mock_user_profile");
      current = raw ? JSON.parse(raw) : null;
    } catch {}
    current =
      current || {
        id: "u-1",
        username: "mockuser",
        email: "mock@example.com",
        role: "user",
      };
    const next = { ...current, ...data };
    try {
      localStorage.setItem("mock_user_profile", JSON.stringify(next));
    } catch {}
    return next;
  },

  /** Categories */
  getCategories: async () => {
    await maybeDelay();
    return mockCategories;
  },

  /** Recipes */
  listRecipes: async (params = {}) => {
    await maybeDelay();
    // Support optional pagination: page, pageSize; and filters: q, category, cuisine, difficulty, sort
    const { page, pageSize, q = "", ...filters } = params || {};

    // Start with full set, apply non-q filters/sort via getMockRecipes for consistency
    let base = getMockRecipes({ ...filters });

    // Apply 'q' if present: match title, description, ingredients, category (case-insensitive)
    const query = String(q || "").trim().toLowerCase();
    if (query) {
      base = base.filter((r) => {
        const title = String(r.title || "").toLowerCase();
        const desc = String(r.description || "").toLowerCase();
        const cat = String(r.category || "").toLowerCase();
        const ings = (r.ingredients || []).map((i) => String(i || "").toLowerCase());
        return (
          title.includes(query) ||
          desc.includes(query) ||
          cat.includes(query) ||
          ings.some((i) => i.includes(query))
        );
      });
    }

    // Keep sort effect already applied by getMockRecipes
    // Apply pagination last (if present)
    let out = base;
    if (page != null && pageSize != null && Number(page) > 0 && Number(pageSize) > 0) {
      const p = Number(page);
      const ps = Number(pageSize);
      const start = (p - 1) * ps;
      out = base.slice(start, start + ps);
    }

    return out;
  },
  getRecipe: async (id) => {
    await maybeDelay();
    const r = getMockRecipeById(id);
    if (!r) {
      const e = new Error("Recipe not found");
      e.status = 404;
      throw e;
    }
    return r;
  },
  createRecipe: async (recipe) => {
    await maybeDelay();
    // Not persisted; just echo success with id
    return { ...recipe, id: `r-${Math.floor(Math.random() * 10000)}` };
  },
  updateRecipe: async (id, recipe) => {
    await maybeDelay();
    return { ...recipe, id };
  },
  deleteRecipe: async (_id) => {
    await maybeDelay();
    return { ok: true };
  },

  /** Feedback */
  submitFeedback: async (_feedback) => {
    await maybeDelay();
    return {
      id: `f-${Date.now()}`,
      message: "Thanks for your feedback!",
      createdAt: new Date().toISOString(),
    };
  },
  listFeedback: async () => {
    await maybeDelay();
    return [
      {
        id: "f-1",
        userId: "u-1",
        message: "Loving the mock mode!",
        createdAt: new Date().toISOString(),
      },
      {
        id: "f-2",
        userId: "u-2",
        message: "Recipes look delicious.",
        createdAt: new Date(Date.now() - 864e5).toISOString(),
      },
    ];
  },

  /** Favorites in Mock Mode: persisted in localStorage under 'favorites' (array of recipe IDs) */
  getFavorites: async () => {
    await maybeDelay();
    try {
      const raw = localStorage.getItem("favorites");
      const ids = raw ? JSON.parse(raw) : [];
      return Array.isArray(ids) ? ids : [];
    } catch {
      return [];
    }
  },
  addFavorite: async (recipeId) => {
    await maybeDelay();
    try {
      const raw = localStorage.getItem("favorites");
      const ids = raw ? JSON.parse(raw) : [];
      const next = Array.from(new Set([...(Array.isArray(ids) ? ids : []), String(recipeId)]));
      localStorage.setItem("favorites", JSON.stringify(next));
      return { ok: true };
    } catch {
      return { ok: false };
    }
  },
  removeFavorite: async (recipeId) => {
    await maybeDelay();
    try {
      const raw = localStorage.getItem("favorites");
      const ids = raw ? JSON.parse(raw) : [];
      const next = (Array.isArray(ids) ? ids : []).filter((id) => id !== String(recipeId));
      localStorage.setItem("favorites", JSON.stringify(next));
      return { ok: true };
    } catch {
      return { ok: false };
    }
  },
};

/**
 * INTERNAL: compute mock mode info with multiple sources so previews can enable mock mode
 * without relying solely on build-time env.
 */
function computeMockMode() {
  // Primary: CRA build-time env
  const envEnabled =
    String(process.env.REACT_APP_USE_MOCK_API || "").toLowerCase() === "true";

  // Secondary: query param (useful in preview links): ?mock=true
  let queryEnabled = false;
  try {
    if (typeof window !== "undefined" && window.location?.search) {
      const qs = new URLSearchParams(window.location.search);
      queryEnabled = (qs.get("mock") || "").toLowerCase() === "true";
    }
  } catch {
    // ignore
  }

  // Tertiary: localStorage override (sticky across refresh)
  let storedEnabled = false;
  try {
    storedEnabled =
      String(localStorage.getItem("use_mock_api") || "").toLowerCase() ===
      "true";
  } catch {
    // ignore storage access
  }

  const enabled = envEnabled || queryEnabled || storedEnabled;
  const reason = enabled
    ? envEnabled
      ? "env:REACT_APP_USE_MOCK_API=true"
      : queryEnabled
        ? "query:?mock=true"
        : "localStorage:use_mock_api=true"
    : "disabled";
  return { enabled, reason };
}

// PUBLIC_INTERFACE
export function isMockEnabled() {
  /** Return true if mock mode is enabled via env, query (?mock=true), or localStorage override. */
  return computeMockMode().enabled;
}

// PUBLIC_INTERFACE
export function getMockModeInfo() {
  /** Returns an object with { enabled: boolean, reason: string } for diagnostics and UI. */
  return computeMockMode();
}
