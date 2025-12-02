 /**
  * Utilities for deterministic, food-only mock images using bundled local assets.
  * STRICT: Only local curated images under /assets/food (no external hosts).
  * Primary: local curated image deterministically mapped by recipe properties.
  * Fallbacks: next local curated image (index+1), then local bundled placeholder asset.
  */

const FOOD_ASSETS = Array.from({ length: 12 }, (_v, i) => {
  const idx = String(i + 1).padStart(2, "0");
  return `/assets/food/food-${idx}.jpg`;
});

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
  return String(s || "").toLowerCase();
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

  const cuisine = norm(recipe?.cuisine);
  if (cuisine.includes("ital")) push("italian");
  if (cuisine.includes("mexic")) push("mexican");
  if (cuisine.includes("japan")) push("japanese");
  if (cuisine.includes("thai")) push("thai");
  if (cuisine.includes("india")) push("indian");
  if (cuisine.includes("french")) push("french");
  if (cuisine.includes("greek")) push("greek");
  if (cuisine.includes("vietnam")) push("pho");

  const titleTokens = tokensFromString(recipe?.title);
  titleTokens.forEach((t) => {
    const kw = tokenToKeyword[t];
    if (kw) push(kw);
    if (t === "pizza" && !out.includes("pizza")) push("pizza");
    if (t === "salad" && !out.includes("salad")) push("salad");
    if (t === "soup" && !out.includes("soup")) push("soup");
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
 * PUBLIC_INTERFACE
 * Select a local food image URL for a recipe using deterministic mapping.
 * Note: Local assets must not be mutated with cache-busting.
 */
export function selectFoodImageForRecipe(recipe, indexHint) {
  const seed = (indexHint != null ? Number(indexHint) : computeSeed(recipe)) >>> 0;
  // Use keywords to vary offset to reduce collisions across similar IDs
  const kws = getIngredientKeywords(recipe);
  const kwHash = simpleHash(kws.join(",")); // stable based on content
  const idx = pickIndex(seed ^ kwHash, 0);
  return FOOD_ASSETS[idx];
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
  return selectFoodImageForRecipe(recipe);
}

/**
 * PUBLIC_INTERFACE
 * Decide best food image URL for a recipe:
 * - If recipe.imageUrl exists, return it (should already be local in mock mode).
 * - Otherwise compute using deterministic local selection.
 */
export function resolveFoodImageUrl(recipe) {
  const src = recipe?.imageUrl;
  if (src) return src;
  return buildFoodImageUrl(recipe);
}

/**
 * PUBLIC_INTERFACE
 * Compute a deterministic fallback chain for a given recipe (local-only):
 * 1) Primary local curated
 * 2) Alternate local curated (next index)
 * 3) Local placeholder asset (/assets/food-placeholder.jpg)
 */
export function deterministicFallbacks(recipeOrId) {
  const rec = typeof recipeOrId === "string" ? { id: recipeOrId, title: "", category: "", cuisine: "" } : (recipeOrId || {});
  const seed = computeSeed(rec);
  const idx1 = pickIndex(seed, 0);
  const idx2 = pickIndex(seed, 1);
  const primary = FOOD_ASSETS[idx1];
  const curated = FOOD_ASSETS[idx2];
  return {
    primary,
    curated,
    local: "/assets/food-placeholder.jpg",
  };
}
