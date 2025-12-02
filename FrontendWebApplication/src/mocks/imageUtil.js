/**
 * Utilities for deterministic, category/cuisine-aware mock images using bundled local assets.
 * STRICT: Only local curated images under /assets/food (no external hosts). No cache busters on local files.
 * Primary: category-based local image(s); fallback via cuisine mapping; otherwise general pool.
 * Fallbacks: next deterministic local curated image, then local placeholder.
 */

// 1) Curated local food library
const FOOD_ASSETS = Array.from({ length: 12 }, (_v, i) => {
  const idx = String(i + 1).padStart(2, "0");
  return `/assets/food/food-${idx}.jpg`;
});

// 2) Category-to-local-image map
// Multiple images per category increase visual variety; indices are deterministic via hashing.
const CATEGORY_IMAGE_MAP = {
  dessert: [FOOD_ASSETS[4], FOOD_ASSETS[10]],          // e.g., sweets
  salad: [FOOD_ASSETS[6], FOOD_ASSETS[5]],
  pasta: [FOOD_ASSETS[2], FOOD_ASSETS[8]],
  soup: [FOOD_ASSETS[7], FOOD_ASSETS[9]],
  curry: [FOOD_ASSETS[9], FOOD_ASSETS[11]],
  breakfast: [FOOD_ASSETS[0], FOOD_ASSETS[5]],
  pizza: [FOOD_ASSETS[8], FOOD_ASSETS[2]],
  tacos: [FOOD_ASSETS[3], FOOD_ASSETS[1]],
  vegan: [FOOD_ASSETS[5], FOOD_ASSETS[6]],
  "grill/bbq": [FOOD_ASSETS[11], FOOD_ASSETS[3]],
  seafood: [FOOD_ASSETS[7], FOOD_ASSETS[9]],
  sandwich: [FOOD_ASSETS[1], FOOD_ASSETS[6]],
  "stir-fry": [FOOD_ASSETS[2], FOOD_ASSETS[11]],
  "rice/biryani": [FOOD_ASSETS[9], FOOD_ASSETS[7]],
  lunch: [FOOD_ASSETS[1], FOOD_ASSETS[6]],
  dinner: [FOOD_ASSETS[2], FOOD_ASSETS[8]],
  snack: [FOOD_ASSETS[1], FOOD_ASSETS[0]],
  vegetarian: [FOOD_ASSETS[5], FOOD_ASSETS[6]],
};

// 3) Cuisine fallback mapping to category keys above
const CUISINE_TO_CATEGORY = {
  italian: ["pasta", "pizza"],
  mexican: ["tacos"],
  indian: ["curry", "rice/biryani"],
  japanese: ["sushi", "ramen"], // sushi/ramen not explicit categories; fallback to seafood/pasta indices
  chinese: ["stir-fry", "rice/biryani"],
  thai: ["soup", "stir-fry"],
  greek: ["salad"],
  french: ["dessert", "soup"],
  vietnamese: ["soup", "rice/biryani"],
  american: ["burger", "sandwich"], // burger not explicit → sandwich/stir-fry reuse
  middle: ["vegan", "sandwich"], // Middle Eastern → vegan/sandwich (falafel/hummus wraps)
};

// Normalize cuisine alias not strictly matching keys (e.g., "Middle Eastern")
function normalizeCuisineKey(c) {
  const s = norm(c);
  if (!s) return "";
  if (s.includes("middle")) return "middle";
  return s;
}

/** Hash utility for deterministic mapping */
function simpleHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return h >>> 0;
}

/** Normalize strings */
function norm(s) {
  return String(s || "").trim().toLowerCase();
}

/** Tokenize string to keywords */
function tokensFromString(s) {
  return norm(s)
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * PUBLIC_INTERFACE
 * Extract normalized ingredient/category/cuisine/title keywords from a recipe.
 */
export function getIngredientKeywords(recipe) {
  const out = [];
  const push = (k) => {
    if (k && !out.includes(k)) out.push(k);
  };

  const ingredients = Array.isArray(recipe?.ingredients) ? recipe.ingredients : [];
  const ingredientTokens = ingredients.flatMap(tokensFromString);

  const tokenToKeyword = {
    chicken: "chicken",
    thigh: "chicken",
    beef: "beef",
    pork: "pork",
    shrimp: "shrimp",
    prawn: "shrimp",
    fish: "fish",
    salmon: "fish",
    tuna: "fish",
    tofu: "tofu",
    chickpea: "vegan",
    chickpeas: "vegan",
    avocado: "avocado",
    noodle: "pasta",
    noodles: "pasta",
    spaghetti: "pasta",
    pasta: "pasta",
    tomato: "pizza",
    mozzarella: "pizza",
    basil: "pizza",
    tortilla: "taco",
    tortillas: "taco",
    taco: "taco",
    tacos: "taco",
    lettuce: "salad",
    salad: "salad",
    soup: "soup",
    broth: "soup",
    curry: "curry",
    ramen: "ramen",
    sushi: "sushi",
    egg: "omelette",
    eggs: "omelette",
    pancake: "pancake",
    pancakes: "pancake",
    waffle: "waffle",
    waffles: "waffle",
    brownie: "brownie",
    brownies: "brownie",
    muffin: "muffin",
    muffins: "muffin",
    hummus: "hummus",
    falafel: "falafel",
    tahini: "falafel",
    shakshuka: "shakshuka",
    pho: "pho",
    quinoa: "vegan",
    spinach: "salad",
    feta: "salad",
    cheese: "sandwich",
    bread: "sandwich",
    sandwich: "sandwich",
    burger: "burger",
  };

  ingredientTokens.forEach((t) => {
    const kw = tokenToKeyword[t];
    if (kw) push(kw);
  });

  const category = norm(recipe?.category);
  if (category.includes("dessert")) push("dessert");
  if (category.includes("salad")) push("salad");
  if (category.includes("soup")) push("soup");
  if (category.includes("breakfast")) push("breakfast");
  if (category.includes("vegan")) push("vegan");
  if (category.includes("vegetarian")) push("vegetarian");
  if (category.includes("lunch")) push("lunch");
  if (category.includes("dinner")) push("dinner");
  if (category.includes("pizza")) push("pizza");
  if (category.includes("taco")) push("tacos");
  if (category.includes("stir")) push("stir-fry");

  const cuisine = norm(recipe?.cuisine);
  if (cuisine) {
    const cKey = normalizeCuisineKey(cuisine);
    push(cKey);
    if (cKey.includes("ital")) push("italian");
    if (cKey.includes("mexic")) push("mexican");
    if (cKey.includes("japan")) push("japanese");
    if (cKey.includes("thai")) push("thai");
    if (cKey.includes("india")) push("indian");
    if (cKey.includes("french")) push("french");
    if (cKey.includes("greek")) push("greek");
    if (cKey.includes("vietnam")) push("vietnamese");
    if (cKey.includes("americ")) push("american");
    if (cKey.includes("middle")) push("middle");
    if (cKey.includes("chinese")) push("chinese");
  }

  const titleTokens = tokensFromString(recipe?.title);
  titleTokens.forEach((t) => {
    const kw = tokenToKeyword[t];
    if (kw) push(kw);
    if (t === "pizza" && !out.includes("pizza")) push("pizza");
    if (t === "salad" && !out.includes("salad")) push("salad");
    if (t === "soup" && !out.includes("soup")) push("soup");
    if (t === "tacos" && !out.includes("tacos")) push("tacos");
    if (t === "pasta" && !out.includes("pasta")) push("pasta");
  });

  if (!out.length) {
    if (category.includes("dessert")) push("dessert");
    else if (category.includes("salad")) push("salad");
    else if (category.includes("soup")) push("soup");
    else if (category.includes("breakfast")) push("breakfast");
    else if (category) push("dinner");
  }

  return out;
}

/** INTERNAL: compute deterministic seed from recipe props */
function computeSeed(recipe) {
  const str = [
    recipe?.id || "",
    recipe?.title || "",
    recipe?.category || "",
    recipe?.cuisine || "",
  ].join("|");
  return simpleHash(str);
}

/** INTERNAL: pick local food index deterministically with optional offset */
function pickIndex(seed, offset = 0) {
  const n = FOOD_ASSETS.length;
  return Math.abs((seed + offset) >>> 0) % n;
}

/**
 * Try select by category list; when multiple images exist choose a deterministic one by hashing id.
 */
function pickFromListDeterministic(list, recipe) {
  if (!Array.isArray(list) || list.length === 0) return null;
  const idStr = String(recipe?.id || recipe?.title || "0");
  const idx = simpleHash(idStr) % list.length;
  return list[idx];
}

/**
 * PUBLIC_INTERFACE
 * Selects a category-specific local image path. Strategy:
 * a) Category match (case-insensitive) using CATEGORY_IMAGE_MAP
 * b) Cuisine fallback mapping to categories when category mapping is missing
 * c) General deterministic local image when both are missing
 * Returns strictly local paths (/assets/food/food-XX.jpg)
 */
export function selectCategoryImagePath(recipe) {
  const category = norm(recipe?.category);
  const cuisine = normalizeCuisineKey(recipe?.cuisine);

  // a) Category direct match
  if (category) {
    // direct category
    if (CATEGORY_IMAGE_MAP[category]) {
      const chosen = pickFromListDeterministic(CATEGORY_IMAGE_MAP[category], recipe);
      if (chosen) return chosen;
    }
    // partial includes (e.g., "Quick & Easy" not mapped; try known fragments)
    const known = Object.keys(CATEGORY_IMAGE_MAP).find((k) => category.includes(k));
    if (known) {
      const chosen = pickFromListDeterministic(CATEGORY_IMAGE_MAP[known], recipe);
      if (chosen) return chosen;
    }
  }

  // b) Cuisine mapped to categories
  if (cuisine) {
    const mappedCats = CUISINE_TO_CATEGORY[cuisine] ||
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
    if (Array.isArray(mappedCats)) {
      for (const cat of mappedCats) {
        const list = CATEGORY_IMAGE_MAP[cat];
        const chosen = pickFromListDeterministic(list, recipe);
        if (chosen) return chosen;
      }
      // If mapped cuisine categories not found in map, fallback to general pool deterministically
    }
  }

  // c) General deterministic asset based on id hash
  const seed = computeSeed(recipe);
  const idx = pickIndex(seed, 0);
  return FOOD_ASSETS[idx];
}

/**
 * PUBLIC_INTERFACE
 * For legacy callers: choose a local image deterministically with keyword-based variance.
 * Preserved but now defers to selectCategoryImagePath to ensure category-first logic.
 */
export function selectFoodImageForRecipe(recipe, _indexHint) {
  return selectCategoryImagePath(recipe);
}

/**
 * PUBLIC_INTERFACE
 * Returns a guaranteed local placeholder (not cache-busted).
 */
export function getStrictFoodFallback(_width = 1200, _height = 675, _idIndex = 0) {
  return "/assets/food/food-01.jpg";
}

/**
 * PUBLIC_INTERFACE
 * Build a deterministic local food image URL.
 */
export function buildFoodImageUrl(recipe) {
  if (!recipe) return FOOD_ASSETS[0];
  return selectCategoryImagePath(recipe);
}

/**
 * PUBLIC_INTERFACE
 * Decide best food image URL for a recipe:
 * - If recipe.imageUrl exists, return it (should already be local in mock mode).
 * - Otherwise compute using category-aware selector.
 */
export function resolveFoodImageUrl(recipe) {
  const src = recipe?.imageUrl;
  if (src) return src;
  return buildFoodImageUrl(recipe);
}

/**
 * PUBLIC_INTERFACE
 * Compute a deterministic fallback chain for a given recipe (local-only):
 * 1) Primary local curated (category-aware)
 * 2) Alternate local curated (next index from general pool)
 * 3) Local placeholder asset (/assets/food-placeholder.jpg)
 */
export function deterministicFallbacks(recipeOrId) {
  const rec = typeof recipeOrId === "string" ? { id: recipeOrId, title: "", category: "", cuisine: "" } : (recipeOrId || {});
  const primary = selectCategoryImagePath(rec);

  // Alternate: choose "next" index deterministically from the general pool to avoid loops
  const seed = computeSeed(rec);
  const idx2 = pickIndex(seed, 1);
  const curated = FOOD_ASSETS[idx2] === primary ? FOOD_ASSETS[pickIndex(seed, 2)] : FOOD_ASSETS[idx2];

  return {
    primary,
    curated,
    local: "/assets/food-placeholder.jpg",
  };
}
