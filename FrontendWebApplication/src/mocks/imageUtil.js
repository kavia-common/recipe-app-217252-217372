/**
 * Utilities for deterministic, category/cuisine/ingredient-aware mock images using bundled local assets.
 * STRICT: Only local curated images under /assets/food (no external hosts). No query cache-busters on local files.
 * Primary: category group image; fallback within group; then cuisine group; then general pool. Final: local placeholder.
 * Guarantees: stable per-recipe path and minimizes duplicates across first N recipes by cycling within groups.
 */

// Build a larger curated local library (24 images recommended; we’ll support any N>=12 available)
const MAX_ASSETS = 24;
const FOOD_ASSETS = Array.from({ length: MAX_ASSETS }, (_v, i) => {
  const idx = String(i + 1).padStart(2, "0");
  return `/assets/food/food-${idx}.jpg`;
});

// Category groups map to sequences of indices into FOOD_ASSETS.
// Keep groups non-overlapping where possible to reduce duplicates across categories.
const CAT_GROUPS = {
  breakfast: [0, 5, 12, 18],
  lunch: [1, 6, 13, 19],
  dinner: [2, 8, 14, 20],
  dessert: [4, 10, 16, 22],
  salad: [6, 5, 17, 21],
  pasta: [2, 8, 14],
  soup: [7, 9, 15, 23],
  curry: [9, 11, 20],
  pizza: [8, 2, 14],
  tacos: [3, 1, 13],
  vegan: [5, 6, 17],
  vegetarian: [5, 6, 17],
  "grill/bbq": [11, 3, 19],
  seafood: [7, 9, 15],
  sandwich: [1, 6, 13],
  "stir-fry": [2, 11, 14],
  "rice/biryani": [9, 7, 15],
  snack: [1, 0, 12],
};

// Cuisine to category groups (fall back chain)
const CUISINE_TO_CATEGORY = {
  italian: ["pasta", "pizza"],
  mexican: ["tacos"],
  indian: ["curry", "rice/biryani"],
  japanese: ["seafood", "soup"], // proxy for sushi/ramen
  chinese: ["stir-fry", "rice/biryani"],
  thai: ["soup", "stir-fry"],
  greek: ["salad"],
  french: ["dessert", "soup"],
  vietnamese: ["soup", "rice/biryani"],
  american: ["sandwich", "snack"],
  middle: ["vegan", "sandwich"], // Middle Eastern
};

function norm(s) {
  return String(s || "").trim().toLowerCase();
}

function normalizeCuisineKey(c) {
  const s = norm(c);
  if (!s) return "";
  if (s.includes("middle")) return "middle";
  return s;
}

function simpleHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return h >>> 0;
}

// PUBLIC_INTERFACE
export function getIngredientKeywords(recipe) {
  const out = [];
  const push = (k) => {
    if (k && !out.includes(k)) out.push(k);
  };
  const ingredients = Array.isArray(recipe?.ingredients) ? recipe.ingredients : [];
  const tokens = ingredients
    .map((s) => norm(s).replace(/[^a-z0-9\s-]/g, " ").split(/\s+/).filter(Boolean))
    .flat();

  const tokenToKeyword = {
    chicken: "chicken",
    thigh: "chicken",
    beef: "beef",
    pork: "pork",
    shrimp: "seafood",
    prawn: "seafood",
    fish: "seafood",
    salmon: "seafood",
    tuna: "seafood",
    tofu: "vegan",
    chickpea: "vegan",
    chickpeas: "vegan",
    avocado: "vegan",
    noodle: "pasta",
    noodles: "pasta",
    spaghetti: "pasta",
    pasta: "pasta",
    tomato: "pizza",
    mozzarella: "pizza",
    basil: "pizza",
    tortilla: "tacos",
    tortillas: "tacos",
    taco: "tacos",
    tacos: "tacos",
    lettuce: "salad",
    salad: "salad",
    soup: "soup",
    broth: "soup",
    curry: "curry",
    ramen: "soup",
    sushi: "seafood",
    egg: "breakfast",
    eggs: "breakfast",
    pancake: "breakfast",
    pancakes: "breakfast",
    waffle: "breakfast",
    waffles: "breakfast",
    brownie: "dessert",
    brownies: "dessert",
    muffin: "dessert",
    muffins: "dessert",
    hummus: "vegan",
    falafel: "vegan",
    tahini: "vegan",
    shakshuka: "breakfast",
    pho: "soup",
    quinoa: "vegan",
    spinach: "salad",
    feta: "salad",
    cheese: "sandwich",
    bread: "sandwich",
    sandwich: "sandwich",
    burger: "sandwich",
  };

  tokens.forEach((t) => {
    const kw = tokenToKeyword[t];
    if (kw) push(kw);
  });

  const category = norm(recipe?.category);
  if (category) {
    Object.keys(CAT_GROUPS).forEach((k) => {
      if (category.includes(k)) push(k);
    });
  }

  const cuisine = normalizeCuisineKey(recipe?.cuisine);
  if (cuisine) push(cuisine);

  const title = norm(recipe?.title);
  if (title.includes("pizza")) push("pizza");
  if (title.includes("salad")) push("salad");
  if (title.includes("soup")) push("soup");
  if (title.includes("pasta")) push("pasta");
  if (title.includes("taco")) push("tacos");

  if (!out.length) {
    if (category.includes("dessert")) push("dessert");
    else if (category.includes("salad")) push("salad");
    else if (category.includes("soup")) push("soup");
    else if (category.includes("breakfast")) push("breakfast");
    else if (category) push("dinner");
  }

  return out;
}

// Internal helpers for deterministic selection
function computeSeed(recipe) {
  const str = [
    recipe?.id || "",
    recipe?.title || "",
    recipe?.category || "",
    recipe?.cuisine || "",
  ].join("|");
  return simpleHash(str);
}

function pickIndex(seed, n, offset = 0) {
  if (n <= 0) return 0;
  return Math.abs((seed + offset) >>> 0) % n;
}

function groupAssetAt(groupKey, recipe, offset = 0) {
  const arr = CAT_GROUPS[groupKey];
  if (!arr || !arr.length) return null;
  const seed = computeSeed(recipe);
  const idx = pickIndex(seed, arr.length, offset);
  const assetIdx = arr[idx] % FOOD_ASSETS.length;
  return FOOD_ASSETS[assetIdx];
}

function firstMatchingCategoryKey(category) {
  const c = norm(category);
  if (!c) return "";
  const direct = CAT_GROUPS[c] ? c : "";
  if (direct) return direct;
  const found = Object.keys(CAT_GROUPS).find((k) => c.includes(k));
  return found || "";
}

// PUBLIC_INTERFACE
export function selectCategoryImagePath(recipe) {
  const category = norm(recipe?.category);
  const cuisine = normalizeCuisineKey(recipe?.cuisine);
  const seed = computeSeed(recipe);

  // 1) Category group primary pick
  const catKey = firstMatchingCategoryKey(category);
  if (catKey) {
    const primary = groupAssetAt(catKey, recipe, 0);
    if (primary) return primary;
  }

  // 2) Cuisine mapped categories
  if (cuisine) {
    const mapped = CUISINE_TO_CATEGORY[cuisine] ||
      (cuisine.includes("ital") ? CUISINE_TO_CATEGORY["italian"] :
        cuisine.includes("mexic") ? CUISINE_TO_CATEGORY["mexican"] :
          cuisine.includes("india") ? CUISINE_TO_CATEGORY["indian"] :
            cuisine.includes("japan") ? CUISINE_TO_CATEGORY["japanese"] :
              cuisine.includes("chinese") ? CUISINE_TO_CATEGORY["chinese"] :
                cuisine.includes("thai") ? CUISINE_TO_CATEGORY["thai"] :
                  cuisine.includes("greek") ? CUISINE_TO_CATEGORY["greek"] :
                    cuisine.includes("french") ? CUISINE_TO_CATEGORY["french"] :
                      cuisine.includes("vietnam") ? CUISINE_TO_CATEGORY["vietnamese"] :
                        cuisine.includes("americ") ? CUISINE_TO_CATEGORY["american"] :
                          cuisine.includes("middle") ? CUISINE_TO_CATEGORY["middle"] : null);
    if (Array.isArray(mapped)) {
      for (const mk of mapped) {
        const img = groupAssetAt(mk, recipe, 0);
        if (img) return img;
      }
    }
  }

  // 3) Ingredient-driven nudge within known groups
  const kws = getIngredientKeywords(recipe);
  for (const kw of kws) {
    if (CAT_GROUPS[kw]) {
      const img = groupAssetAt(kw, recipe, 0);
      if (img) return img;
    }
  }

  // 4) General pool deterministic (spread across 24)
  const idx = pickIndex(seed, FOOD_ASSETS.length, 0);
  return FOOD_ASSETS[idx];
}

// PUBLIC_INTERFACE
export function selectFoodImageForRecipe(recipe, _indexHint) {
  return selectCategoryImagePath(recipe);
}

// PUBLIC_INTERFACE
export function getStrictFoodFallback() {
  return "/assets/food-placeholder.jpg";
}

// PUBLIC_INTERFACE
export function buildFoodImageUrl(recipe) {
  if (!recipe) return FOOD_ASSETS[0];
  return selectCategoryImagePath(recipe);
}

// PUBLIC_INTERFACE
export function resolveFoodImageUrl(recipe) {
  const src = recipe?.imageUrl;
  if (src && (src.startsWith("/") || src.startsWith("./") || src.startsWith("../"))) return src;
  return buildFoodImageUrl(recipe);
}

// PUBLIC_INTERFACE
export function deterministicFallbacks(recipeOrId) {
  const rec = typeof recipeOrId === "string" ? { id: recipeOrId } : (recipeOrId || {});
  const primary = selectCategoryImagePath(rec);
  const seed = computeSeed(rec);

  // Prefer next index within same category group when possible
  const catKey = firstMatchingCategoryKey(rec.category);
  let curated;
  if (catKey) {
    curated = groupAssetAt(catKey, rec, 1);
    if (curated === primary) curated = groupAssetAt(catKey, rec, 2);
  }
  if (!curated) {
    const idx2 = pickIndex(seed, FOOD_ASSETS.length, 1);
    curated = FOOD_ASSETS[idx2] === primary ? FOOD_ASSETS[(idx2 + 1) % FOOD_ASSETS.length] : FOOD_ASSETS[idx2];
  }

  return {
    primary,
    curated,
    local: "/assets/food-placeholder.jpg",
  };
}
