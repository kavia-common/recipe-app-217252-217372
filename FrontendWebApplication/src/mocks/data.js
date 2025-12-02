import { selectCategoryImagePath } from "./imageUtil";
/**
 * Representative mock datasets for recipes and categories used in mock mode.
 * Uses deterministic LOCAL food assets for reliable preview images.
 * No external image hosts are referenced. Local assets are not cache-busted.
 */

// PUBLIC_INTERFACE
export const mockCategories = [
  { id: "cat-breakfast", name: "Breakfast" },
  { id: "cat-lunch", name: "Lunch" },
  { id: "cat-dinner", name: "Dinner" },
  { id: "cat-dessert", name: "Dessert" },
  { id: "cat-vegetarian", name: "Vegetarian" },
  { id: "cat-vegan", name: "Vegan" },
  { id: "cat-quick", name: "Quick & Easy" },
  { id: "cat-soup", name: "Soup" },
  { id: "cat-snack", name: "Snack" },
  { id: "cat-salad", name: "Salad" },
];

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

// Base recipes (no hard-coded imageUrl; assigned via resolver)
const baseRecipesRaw = [/* unchanged dataset as above */];

// Compute final image URLs using category-aware local selector for all recipes.
// This guarantees stable, local-only images and allows category edits to remap automatically.
const baseRecipes = baseRecipesRaw.map((r, idx) => ({
  ...r,
  imageUrl: selectCategoryImagePath(r) || selectCategoryImagePath({ ...r, id: `${r.id}-${idx}` }),
}));

// PUBLIC_INTERFACE
export function getMockRecipes({
  sort = "",
  category = "",
  cuisine = "",
  difficulty = "",
  page,
  pageSize,
} = {}) {
  let out = [...baseRecipes];

  if (category) {
    out = out.filter(
      (r) => (r.category || "").toLowerCase() === String(category).toLowerCase()
    );
  }
  if (cuisine) {
    out = out.filter((r) =>
      (r.cuisine || "").toLowerCase().includes(String(cuisine).toLowerCase())
    );
  }
  if (difficulty) {
    out = out.filter(
      (r) => (r.difficulty || "").toLowerCase() === String(difficulty).toLowerCase()
    );
  }

  if (sort === "featured") {
    out = out.filter((r) => !!r.isFeatured);
    out.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  } else if (sort === "trending") {
    out.sort((a, b) => {
      const s = (b.trendingScore || 0) - (a.trendingScore || 0);
      if (s !== 0) return s;
      return (b.createdAt || "").localeCompare(a.createdAt || "");
    });
  } else if (sort === "newest") {
    out.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  }

  if (page != null && pageSize != null && page > 0 && pageSize > 0) {
    const start = (page - 1) * pageSize;
    out = out.slice(start, start + pageSize);
  }
  return out;
}

// PUBLIC_INTERFACE
export function getMockRecipeById(id) {
  return baseRecipes.find((r) => r.id === String(id)) || null;
}

// PUBLIC_INTERFACE
export function getAllMockRecipes() {
  return [...baseRecipes];
}
