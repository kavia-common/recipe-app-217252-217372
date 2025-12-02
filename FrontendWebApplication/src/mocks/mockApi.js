//
//
// Mock API implementation for no-backend preview mode.
// This module mirrors src/api/client.js Api surface where required by the UI.
//
import { getMockRecipeById, getMockRecipes, mockCategories, getAllMockRecipes } from "./data";

// Simulate latency to better reflect UX without network
const delay = (ms) => new Promise((res) => setTimeout(res, ms));
const maybeDelay = async () => {
  const rand = Math.random();
  const ms = 80 + Math.round(rand * 220);
  await delay(ms);
};

const RECIPES_KEY = "mock_recipes_dataset";

function readRecipes() {
  try {
    const raw = localStorage.getItem(RECIPES_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr) && arr.length > 0) return arr;
    }
  } catch {
    // ignore
  }
  // Bootstrap from static dataset on first use
  const seed = getAllMockRecipes();
  writeRecipes(seed);
  return seed;
}

function writeRecipes(arr) {
  try {
    localStorage.setItem(RECIPES_KEY, JSON.stringify(Array.isArray(arr) ? arr : []));
  } catch {
    // ignore
  }
}

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

  /** Recipes (with localStorage persistence) */
  listRecipes: async (params = {}) => {
    await maybeDelay();
    const dataset = readRecipes();
    // Apply filters and sorts; extend with newest, most-liked, fastest
    const { page, pageSize, q = "", category = "", cuisine = "", difficulty = "", sort = "" } = params || {};

    // Read favorites and mock likes map from localStorage for "most-liked"
    const readFavorites = () => {
      try {
        const raw = localStorage.getItem("favorites");
        const ids = raw ? JSON.parse(raw) : [];
        return Array.isArray(ids) ? ids.map(String) : [];
      } catch {
        return [];
      }
    };
    const ensureMockLikes = (all) => {
      // Map recipeId -> likes; initialize stable fallback based on id hash if absent
      let map = {};
      try {
        const raw = localStorage.getItem("mockLikes");
        map = raw ? JSON.parse(raw) : {};
      } catch {
        map = {};
      }
      const getSeed = (rid) => {
        const s = String(rid || "");
        let h = 0;
        for (let i = 0; i < s.length; i++) h = (h * 33 + s.charCodeAt(i)) >>> 0;
        // produce small baseline likes 0..9
        return h % 10;
      };
      const next = { ...map };
      for (const r of all) {
        const k = String(r.id);
        if (next[k] == null) next[k] = (typeof r.likes === "number" ? r.likes : undefined) ?? getSeed(k);
      }
      try { localStorage.setItem("mockLikes", JSON.stringify(next)); } catch {}
      return next;
    };

    let base = [...dataset];

    // Apply filters
    if (category) {
      const cat = String(category).trim();
      const tlc = ["veg", "non-veg", "snacks", "desserts"];
      if (tlc.includes(cat.toLowerCase())) {
        base = base.filter((r) => (r.topLevelCategory || "").toLowerCase() === cat.toLowerCase());
      } else {
        base = base.filter((r) => (r.category || "").toLowerCase() === cat.toLowerCase());
      }
    }
    if (cuisine) {
      base = base.filter((r) => (r.cuisine || "").toLowerCase().includes(String(cuisine).toLowerCase()));
    }
    if (difficulty) {
      base = base.filter((r) => (r.difficulty || "").toLowerCase() === String(difficulty).toLowerCase());
    }

    // Sorts
    const sortKey = String(sort || "").toLowerCase();
    if (sortKey === "featured") {
      base = base.filter((r) => !!r.isFeatured);
      base.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
    } else if (sortKey === "trending") {
      base.sort((a, b) => {
        const s = (b.trendingScore || 0) - (a.trendingScore || 0);
        if (s !== 0) return s;
        return (b.createdAt || "").localeCompare(a.createdAt || "");
      });
    } else if (sortKey === "newest") {
      base.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
    } else if (sortKey === "price") {
      base.sort((a, b) => {
        const ap = typeof a.price === "number" ? a.price : Number.POSITIVE_INFINITY;
        const bp = typeof b.price === "number" ? b.price : Number.POSITIVE_INFINITY;
        return ap - bp;
      });
    } else if (sortKey === "most-liked") {
      const favs = readFavorites();
      const likesMap = ensureMockLikes(dataset);
      const likeScore = (r) => {
        const rid = String(r.id);
        const baseline = typeof r.likes === "number" ? r.likes : (likesMap[rid] ?? 0);
        const favBonus = favs.includes(rid) ? 1 : 0;
        return baseline + favBonus;
      };
      base.sort((a, b) => {
        const s = likeScore(b) - likeScore(a);
        if (s !== 0) return s;
        return (b.createdAt || "").localeCompare(a.createdAt || "");
      });
      // annotate for diagnostics (non-persistent)
      base = base.map((r) => ({ ...r, __mockLikes: likeScore(r) }));
    } else if (sortKey === "fastest") {
      const time = (r) => {
        if (typeof r.cookTime === "number") return r.cookTime;
        const prep = Number(r.prepTime || 0);
        const cook = Number(r.cookTime || 0);
        return prep + cook;
      };
      base.sort((a, b) => {
        const sa = time(a);
        const sb = time(b);
        if (sa !== sb) return sa - sb; // ascending
        return (a.title || "").localeCompare(b.title || "");
      });
    }

    // Search q
    const query = String(q || "").trim().toLowerCase();
    if (query) {
      base = base.filter((r) => {
        const title = String(r.title || "").toLowerCase();
        const desc = String(r.description || "").toLowerCase();
        const cat = String(r.category || "").toLowerCase();
        const ings = (r.ingredients || []).map((i) => String(i || "").toLowerCase());
        const tlc = String(r.topLevelCategory || "").toLowerCase();
        return (
          title.includes(query) ||
          desc.includes(query) ||
          cat.includes(query) ||
          tlc.includes(query) ||
          ings.some((i) => i.includes(query))
        );
      });
    }

    // Pagination
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
    const ds = readRecipes();
    const r = ds.find((x) => String(x.id) === String(id));
    if (!r) {
      const e = new Error("Recipe not found");
      e.status = 404;
      throw e;
    }
    return r;
  },
  createRecipe: async (recipe) => {
    await maybeDelay();
    const ds = readRecipes();
    const newId = `r-${Date.now()}`;
    const next = { ...recipe, id: newId, createdAt: new Date().toISOString() };
    writeRecipes([next, ...ds]);
    return next;
  },
  updateRecipe: async (id, recipe) => {
    await maybeDelay();
    const ds = readRecipes();
    const idx = ds.findIndex((x) => String(x.id) === String(id));
    if (idx === -1) {
      const e = new Error("Recipe not found");
      e.status = 404;
      throw e;
    }
    const updated = { ...ds[idx], ...recipe, id: String(id) };
    const next = [...ds];
    next[idx] = updated;
    writeRecipes(next);
    return updated;
  },
  deleteRecipe: async (id) => {
    await maybeDelay();
    const ds = readRecipes();
    const next = ds.filter((x) => String(x.id) !== String(id));
    if (next.length === ds.length) {
      const e = new Error("Recipe not found");
      e.status = 404;
      throw e;
    }
    writeRecipes(next);
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
      // optional: increment mockLikes
      try {
        const rid = String(recipeId);
        const lmRaw = localStorage.getItem("mockLikes");
        const lm = lmRaw ? JSON.parse(lmRaw) : {};
        lm[rid] = (lm[rid] ?? 0) + 1;
        localStorage.setItem("mockLikes", JSON.stringify(lm));
      } catch {}
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
      // optional: decrement mockLikes
      try {
        const rid = String(recipeId);
        const lmRaw = localStorage.getItem("mockLikes");
        const lm = lmRaw ? JSON.parse(lmRaw) : {};
        if (typeof lm[rid] === "number" && lm[rid] > 0) lm[rid] = lm[rid] - 1;
        localStorage.setItem("mockLikes", JSON.stringify(lm));
      } catch {}
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
