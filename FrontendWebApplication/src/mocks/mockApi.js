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
    return { accessToken: "mock-token", expiresIn: 3600, user: { id: "u-1", username: email.split("@")[0], email, role: "user" } };
  },
  register: async (username, email, _password) => {
    await maybeDelay();
    return { id: "u-1", username, email, role: "user", createdAt: new Date().toISOString() };
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
    return { id: "u-1", username: "mockuser", email: "mock@example.com", role: "user" };
  },
  updateProfile: async (data) => {
    await maybeDelay();
    const current = (await this.getProfile?.()) || { id: "u-1", username: "mockuser", email: "mock@example.com", role: "user" };
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
    return getMockRecipes(params);
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
    return { id: `f-${Date.now()}`, message: "Thanks for your feedback!", createdAt: new Date().toISOString() };
  },
  listFeedback: async () => {
    await maybeDelay();
    return [
      { id: "f-1", userId: "u-1", message: "Loving the mock mode!", createdAt: new Date().toISOString() },
      { id: "f-2", userId: "u-2", message: "Recipes look delicious.", createdAt: new Date(Date.now() - 864e5).toISOString() },
    ];
  },
};

/**
 * INTERNAL: compute mock mode info with multiple sources so previews can enable mock mode
 * without relying solely on build-time env.
 */
function computeMockMode() {
  // Primary: CRA build-time env
  const envEnabled = String(process.env.REACT_APP_USE_MOCK_API || "").toLowerCase() === "true";

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
    storedEnabled = String(localStorage.getItem("use_mock_api") || "").toLowerCase() === "true";
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
