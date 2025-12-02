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

// Utility: derive top-level category from recipe hints
function deriveTopLevelCategory(r) {
  const norm = (s) => String(s || "").toLowerCase();
  const title = norm(r.title);
  const cat = norm(r.category);
  const ings = (r.ingredients || []).map((i) => norm(i));
  // Desserts
  const dessertHints = ["dessert", "cake", "brownie", "cookie", "muffin", "sweet", "ice cream", "pudding"];
  if (dessertHints.some((h) => title.includes(h) || cat.includes(h))) return "Desserts";
  // Snacks
  const snackHints = ["snack", "taco", "tacos", "chips", "wrap", "sandwich", "burger", "bites", "finger"];
  if (snackHints.some((h) => title.includes(h) || cat.includes(h))) return "Snacks";
  // Non-Veg if any meat/seafood present
  const nonVegTokens = ["chicken", "beef", "pork", "lamb", "shrimp", "prawn", "fish", "salmon", "tuna", "egg", "eggs", "bacon", "ham"];
  if (ings.some((i) => nonVegTokens.some((t) => i.includes(t)))) return "Non-Veg";
  if (/(chicken|beef|pork|lamb|shrimp|prawn|fish|salmon|tuna|egg|bacon|ham)/.test(title)) return "Non-Veg";
  if (/(chicken|beef|pork|lamb|shrimp|prawn|fish|salmon|tuna|egg|bacon|ham)/.test(cat)) return "Non-Veg";
  // Veg (default when likely vegetarian/vegan)
  return "Veg";
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

// Base recipes (no hard-coded imageUrl; assigned via resolver)
const baseRecipesRaw = [/* unchanged dataset as above */];

// Compute final image URLs using category-aware local selector for all recipes.
// Also assign a derived top-level category field for mock filtering.
const baseRecipes = baseRecipesRaw.map((r, idx) => {
  const imageUrl = selectCategoryImagePath(r) || selectCategoryImagePath({ ...r, id: `${r.id}-${idx}` });
  const top = deriveTopLevelCategory(r);
  // Assign a reasonable mock price if missing: deterministic by id for stability
  let price = r.price;
  if (price === undefined || price === null || Number(price) < 0) {
    const seed = Array.from(String(r.id || idx)).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    const min = 3.99;
    const max = 29.99;
    const rand = (Math.sin(seed) + 1) / 2; // 0..1 deterministic
    const val = min + rand * (max - min);
    price = Number(val.toFixed(2));
  } else {
    price = Number(Number(price).toFixed(2));
  }
  return { ...r, imageUrl, topLevelCategory: top, price };
});

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

  const cat = String(category || "").trim();

  if (cat) {
    // If category is one of top-level, filter by derived field
    const tlc = ["veg", "non-veg", "snacks", "desserts"];
    if (tlc.includes(cat.toLowerCase())) {
      out = out.filter((r) => (r.topLevelCategory || "").toLowerCase() === cat.toLowerCase());
    } else {
      // Otherwise, standard category equals matching
      out = out.filter(
        (r) => (r.category || "").toLowerCase() === cat.toLowerCase()
      );
    }
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
  } else if (sort === "price") {
    out.sort((a, b) => {
      const ap = typeof a.price === "number" ? a.price : Number.POSITIVE_INFINITY;
      const bp = typeof b.price === "number" ? b.price : Number.POSITIVE_INFINITY;
      return ap - bp; // ascending price
    });
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
