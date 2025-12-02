/**
 * Utilities for deterministic, food-only mock images using hotlink-friendly sources.
 * STRICT: Only curated food images (no generic/landscape generators like picsum).
 * Primary: curated CDN/static set deterministically mapped by recipe id/hash and ingredient-aware keywords.
 * Fallbacks: alternate curated URL, then local bundled placeholder asset.
 */

// Cloudinary demo + jsDelivr assets. Each list is strictly food and safe to hotlink for previews.
const curatedFoodImageMap = {
  chicken: [
    "https://res.cloudinary.com/demo/image/upload/w_1200,h_675,c_fill,q_auto,f_auto/chicken.jpg",
    "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/chicken-curry.jpg",
    "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/roast-chicken.jpg"
  ],
  beef: [
    "https://res.cloudinary.com/demo/image/upload/w_1200,h_675,c_fill,q_auto,f_auto/food/steak.jpg",
    "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/steak.jpg",
    "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/beef-bowl.jpg"
  ],
  pork: [
    "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/pork-noodles.jpg",
    "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/pork-bbq.jpg"
  ],
  shrimp: [
    "https://res.cloudinary.com/demo/image/upload/w_1200,h_675,c_fill,q_auto,f_auto/food/fish.jpg",
    "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/shrimp-pasta.jpg",
    "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/tom-yum.jpg"
  ],
  fish: [
    "https://res.cloudinary.com/demo/image/upload/w_1200,h_675,c_fill,q_auto,f_auto/food/fish.jpg",
    "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/grilled-salmon.jpg"
  ],
  tofu: [
    "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/tofu-stirfry.jpg",
    "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/mapo-tofu.jpg"
  ],
  pasta: [
    "https://res.cloudinary.com/demo/image/upload/w_1200,h_675,c_fill,q_auto,f_auto/food/pasta.jpg",
    "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/pasta.jpg",
    "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/agnio-olio.jpg"
  ],
  pizza: [
    "https://res.cloudinary.com/demo/image/upload/w_1200,h_675,c_fill,q_auto,f_auto/food/pizza.jpg",
    "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/pizza.jpg"
  ],
  salad: [
    "https://res.cloudinary.com/demo/image/upload/w_1200,h_675,c_fill,q_auto,f_auto/food/salad.jpg",
    "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/salad.jpg",
    "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/greek-salad.jpg"
  ],
  soup: [
    "https://res.cloudinary.com/demo/image/upload/w_1200,h_675,c_fill,q_auto,f_auto/food/soup.jpg",
    "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/ramen.jpg",
    "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/tom-yum.jpg"
  ],
  curry: [
    "https://res.cloudinary.com/demo/image/upload/w_1200,h_675,c_fill,q_auto,f_auto/food/curry.jpg",
    "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/curry.jpg",
    "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/chicken-curry.jpg"
  ],
  taco: [
    "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/tacos.jpg"
  ],
  burger: [
    "https://res.cloudinary.com/demo/image/upload/w_1200,h_675,c_fill,q_auto,f_auto/food/burger.jpg",
    "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/burger.jpg"
  ],
  sandwich: [
    "https://res.cloudinary.com/demo/image/upload/w_1200,h_675,c_fill,q_auto,f_auto/food/sandwich.jpg",
    "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/caprese-sandwich.jpg"
  ],
  sushi: [
    "https://res.cloudinary.com/demo/image/upload/w_1200,h_675,c_fill,q_auto,f_auto/food/sushi.jpg"
  ],
  ramen: [
    "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/ramen.jpg"
  ],
  pancake: [
    "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/pancakes.jpg",
  ],
  waffle: [
    "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/waffles.jpg"
  ],
  omelette: [
    "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/omelette.jpg"
  ],
  brownie: [
    "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/brownies.jpg"
  ],
  muffin: [
    "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/muffins.jpg"
  ],
  dessert: [
    "https://res.cloudinary.com/demo/image/upload/w_1200,h_675,c_fill,q_auto,f_auto/food/dessert.jpg",
    "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/pie.jpg",
    "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/brownies.jpg",
    "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/muffins.jpg",
    "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/tiramisu.jpg"
  ],
  vegan: [
    "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/vegan-bowl.jpg",
    "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/fruit-bowl.jpg"
  ],
  vegetarian: [
    "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/vegetarian-bowl.jpg",
    "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/avocado-toast.jpg"
  ],
  avocado: [
    "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/avocado-toast.jpg",
    "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/guacamole.jpg"
  ],
  falafel: [
    "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/falafel.jpg"
  ],
  hummus: [
    "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/hummus.jpg"
  ],
  shakshuka: [
    "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/shakshuka.jpg"
  ],
  pho: [
    "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/pho.jpg"
  ],
  guacamole: [
    "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/guacamole.jpg"
  ],
  pizza_margherita: [
    "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/pizza.jpg"
  ],
  // cuisines/categories fallbacks
  italian: [
    "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/pasta.jpg",
    "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/pizza.jpg"
  ],
  mexican: [
    "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/tacos.jpg",
    "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/guacamole.jpg"
  ],
  japanese: [
    "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/ramen.jpg",
    "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/sushi-bowl.jpg"
  ],
  thai: [
    "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/tom-yum.jpg",
    "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/pad-thai.jpg"
  ],
  indian: [
    "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/chicken-curry.jpg",
    "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/butter-chicken.jpg"
  ],
  french: [
    "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/french-onion-soup.jpg"
  ],
  greek: [
    "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/greek-salad.jpg"
  ],
  middle_eastern: [
    "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/falafel.jpg",
    "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/hummus.jpg",
    "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/shakshuka.jpg"
  ],
  breakfast: [
    "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/pancakes.jpg",
    "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/omelette.jpg",
    "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/waffles.jpg",
    "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/avocado-toast.jpg"
  ],
  lunch: [
    "https://res.cloudinary.com/demo/image/upload/w_1200,h_675,c_fill,q_auto,f_auto/food/sandwich.jpg",
    "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/caprese-sandwich.jpg",
    "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/sushi-bowl.jpg"
  ],
  dinner: [
    "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/steak.jpg",
    "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/pasta.jpg",
    "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/pizza.jpg"
  ],
  dessert_cat: [
    "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/brownies.jpg",
    "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/muffins.jpg",
    "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/pie.jpg",
    "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/tiramisu.jpg"
  ],
  salad_cat: [
    "https://res.cloudinary.com/demo/image/upload/w_1200,h_675,c_fill,q_auto,f_auto/food/salad.jpg",
    "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/greek-salad.jpg"
  ],
  soup_cat: [
    "https://res.cloudinary.com/demo/image/upload/w_1200,h_675,c_fill,q_auto,f_auto/food/soup.jpg",
    "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/french-onion-soup.jpg",
    "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/tom-yum.jpg"
  ]
};

// Flattened fallback list when nothing matches (food-only)
const CURATED_FOOD_WHITELIST = Array.from(
  new Set(
    Object.values(curatedFoodImageMap).flat()
  )
);

/**
 * Make a small, stable, per-build seed based on REACT_APP_IMAGE_CACHE_BUST.
 */
function getBuildSeed() {
  const enabled = String(process.env.REACT_APP_IMAGE_CACHE_BUST || "true").toLowerCase() === "true";
  return enabled ? "1" : "";
}

/** Normalize strings */
function norm(s) {
  return String(s || "").toLowerCase();
}

/** Try to detect keywords in a string */
function tokensFromString(s) {
  return norm(s)
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * PUBLIC_INTERFACE
 * Extract normalized ingredient/category/cuisine/title keywords from a recipe.
 * Returns a prioritized array of keywords e.g., ['chicken','garlic','pasta','salad','curry','soup','taco','pizza','beef','vegan','dessert','pancake','tofu','shrimp']
 */
export function getIngredientKeywords(recipe) {
  const out = [];
  const push = (k) => {
    if (k && !out.includes(k)) out.push(k);
  };

  // Ingredients scanning
  const ingredients = Array.isArray(recipe?.ingredients) ? recipe.ingredients : [];
  const ingredientTokens = ingredients.flatMap(tokensFromString);

  // Map tokens to canonical keywords
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
    rice: "sushi",
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

  // Category to keyword
  const category = norm(recipe?.category);
  if (category.includes("dessert")) push("dessert");
  if (category.includes("salad")) push("salad");
  if (category.includes("soup")) push("soup");
  if (category.includes("breakfast")) push("breakfast");
  if (category.includes("vegan")) push("vegan");
  if (category.includes("vegetarian")) push("vegetarian");
  if (category.includes("lunch")) push("lunch");
  if (category.includes("dinner")) push("dinner");
  if (category.includes("snack")) push("avocado"); // generic snack -> avocado as a pleasant default

  // Cuisine to keyword
  const cuisine = norm(recipe?.cuisine);
  if (cuisine.includes("ital")) push("italian");
  if (cuisine.includes("mexic")) push("mexican");
  if (cuisine.includes("japan")) push("japanese");
  if (cuisine.includes("thai")) push("thai");
  if (cuisine.includes("india")) push("indian");
  if (cuisine.includes("french")) push("french");
  if (cuisine.includes("greek")) push("greek");
  if (cuisine.includes("middle")) push("middle_eastern");
  if (cuisine.includes("vietnam")) push("pho");

  // Title fallback scanning
  const titleTokens = tokensFromString(recipe?.title);
  titleTokens.forEach((t) => {
    const kw = tokenToKeyword[t];
    if (kw) push(kw);
    if (t === "pizza" && !out.includes("pizza")) push("pizza");
    if (t === "salad" && !out.includes("salad")) push("salad");
    if (t === "soup" && !out.includes("soup")) push("soup");
    if (t === "tiramisu") push("dessert");
    if (t === "margherita") push("pizza_margherita");
  });

  // Final category fallbacks
  if (!out.length) {
    if (category.includes("dessert")) push("dessert");
    else if (category.includes("salad")) push("salad");
    else if (category.includes("soup")) push("soup");
    else if (category.includes("breakfast")) push("breakfast");
    else if (category) push("dinner");
  }

  return out;
}

/**
 * Deterministic index/seed from recipe properties for curated selection.
 */
function computeSeed(recipe) {
  const str = [
    recipe?.id || "",
    recipe?.title || "",
    recipe?.category || "",
    recipe?.cuisine || "",
  ].join("|");
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/**
 * INTERNAL: deterministic pick from an array given a seed/index
 */
function pickDeterministic(arr, seed, offset = 0) {
  if (!arr?.length) return null;
  const idx = Math.abs((seed + offset) >>> 0) % arr.length;
  return arr[idx];
}

/**
 * PUBLIC_INTERFACE
 * Select a curated food image URL for a recipe using ingredient-aware keywords.
 * Deterministic choice using recipe.id seed or optional indexHint.
 */
export function selectFoodImageForRecipe(recipe, indexHint) {
  const seed = (indexHint != null ? Number(indexHint) : computeSeed(recipe)) >>> 0;
  const keywords = getIngredientKeywords(recipe);

  // Priority: ingredients-derived keywords (first), then category/cuisine/title-derived pushed later
  for (let i = 0; i < keywords.length; i++) {
    const k = keywords[i];
    const list = curatedFoodImageMap[k];
    if (list && list.length) {
      const chosen = pickDeterministic(list, seed, i); // i as offset improves variability
      if (chosen) {
        const sep = chosen.includes("?") ? "&" : "?";
        const rid = encodeURIComponent(String(recipe?.id || "unknown"));
        const buildSeed = String(process.env.REACT_APP_IMAGE_CACHE_BUST || "true").toLowerCase() === "true" ? "1" : "";
        return `${chosen}${sep}rid=${rid}${buildSeed ? `&v=${buildSeed}` : ""}`;
      }
    }
  }

  // Fallback to global whitelist deterministic selection
  const chosen = pickDeterministic(CURATED_FOOD_WHITELIST, seed, 0) || CURATED_FOOD_WHITELIST[0];
  const sep = chosen.includes("?") ? "&" : "?";
  const rid = encodeURIComponent(String(recipe?.id || "unknown"));
  const buildSeed = String(process.env.REACT_APP_IMAGE_CACHE_BUST || "true").toLowerCase() === "true" ? "1" : "";
  return `${chosen}${sep}rid=${rid}${buildSeed ? `&v=${buildSeed}` : ""}`;
}

/**
 * PUBLIC_INTERFACE
 * Returns a guaranteed placeholder CDN food image URL by deterministic index (whitelist only).
 */
export function getStrictFoodFallback(width = 1200, height = 675, idIndex = 0) {
  const idx = Math.abs(Number(idIndex || 0)) % CURATED_FOOD_WHITELIST.length;
  const base = CURATED_FOOD_WHITELIST[idx];
  const seed = String(process.env.REACT_APP_IMAGE_CACHE_BUST || "true").toLowerCase() === "true" ? "1" : "";
  const q = [`rid=${encodeURIComponent(String(idIndex))}`];
  if (seed) q.push(`v=${seed}`);
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}${q.join("&")}`;
}

/**
 * PUBLIC_INTERFACE
 * Build a deterministic, food-only image URL using ingredient-aware selection as primary.
 */
export function buildFoodImageUrl(recipe) {
  if (!recipe) {
    return getStrictFoodFallback(1200, 675, 0);
  }
  return selectFoodImageForRecipe(recipe);
}

/**
 * PUBLIC_INTERFACE
 * Decide best food image URL for a recipe:
 * - If recipe.imageUrl exists, return it (later normalization by consumer).
 * - Otherwise compute using ingredient-aware selection.
 */
export function resolveFoodImageUrl(recipe) {
  const src = recipe?.imageUrl;
  if (src) return src;
  return buildFoodImageUrl(recipe);
}

/**
 * PUBLIC_INTERFACE
 * Compute a deterministic fallback chain for a given recipe:
 * 1) Primary curated URL (ingredient-aware deterministic)
 * 2) Alternate curated URL (next deterministic index)
 * 3) Local placeholder asset (/assets/food-placeholder.jpg)
 */
export function deterministicFallbacks(recipeOrId) {
  const rec = typeof recipeOrId === "string" ? { id: recipeOrId, title: "", category: "", cuisine: "" } : (recipeOrId || {});
  const primary = selectFoodImageForRecipe(rec, 0);
  // Alternate: shift indexHint by +1 to pick a different URL deterministically
  const curated = selectFoodImageForRecipe(rec, 1);
  return {
    primary,
    curated,
    local: "/assets/food-placeholder.jpg",
  };
}
