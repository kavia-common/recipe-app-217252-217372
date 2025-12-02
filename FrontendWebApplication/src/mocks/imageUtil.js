/**
 * Utilities for deterministic, food-only mock images using hotlink-friendly sources.
 * STRICT: Only curated food images (no generic/landscape generators like picsum).
 * Primary: curated CDN/static set deterministically mapped by recipe id/hash.
 * Fallbacks: alternate curated URL, then local bundled placeholder asset.
 */

// Curated static food-only images hosted on reliable CDNs (Cloudinary demo + jsDelivr).
// This whitelist is strictly food photos and safe to hotlink for previews.
const CURATED_FOOD_WHITELIST = [
  // Cloudinary demo food images
  "https://res.cloudinary.com/demo/image/upload/w_1200,h_675,c_fill,q_auto,f_auto/food/spices.jpg",
  "https://res.cloudinary.com/demo/image/upload/w_1200,h_675,c_fill,q_auto,f_auto/food/fish.jpg",
  "https://res.cloudinary.com/demo/image/upload/w_1200,h_675,c_fill,q_auto,f_auto/food/pasta.jpg",
  "https://res.cloudinary.com/demo/image/upload/w_1200,h_675,c_fill,q_auto,f_auto/food/pizza.jpg",
  "https://res.cloudinary.com/demo/image/upload/w_1200,h_675,c_fill,q_auto,f_auto/food/dessert.jpg",
  "https://res.cloudinary.com/demo/image/upload/w_1200,h_675,c_fill,q_auto,f_auto/food/salad.jpg",
  "https://res.cloudinary.com/demo/image/upload/w_1200,h_675,c_fill,q_auto,f_auto/food/soup.jpg",
  "https://res.cloudinary.com/demo/image/upload/w_1200,h_675,c_fill,q_auto,f_auto/food/burger.jpg",
  "https://res.cloudinary.com/demo/image/upload/w_1200,h_675,c_fill,q_auto,f_auto/food/sandwich.jpg",
  "https://res.cloudinary.com/demo/image/upload/w_1200,h_675,c_fill,q_auto,f_auto/food/sushi.jpg",
  "https://res.cloudinary.com/demo/image/upload/w_1200,h_675,c_fill,q_auto,f_auto/food/taco.jpg",
  "https://res.cloudinary.com/demo/image/upload/w_1200,h_675,c_fill,q_auto,f_auto/food/steak.jpg",
  "https://res.cloudinary.com/demo/image/upload/w_1200,h_675,c_fill,q_auto,f_auto/food/noodles.jpg",
  "https://res.cloudinary.com/demo/image/upload/w_1200,h_675,c_fill,q_auto,f_auto/food/curry.jpg",
  // jsDelivr-hosted curated images
  "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/pizza.jpg",
  "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/pancakes.jpg",
  "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/avocado-toast.jpg",
  "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/salad.jpg",
  "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/burger.jpg",
  "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/tacos.jpg",
  "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/ramen.jpg",
  "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/brownies.jpg",
  "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/muffins.jpg",
  "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/pasta.jpg",
  "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/curry.jpg",
  "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/steak.jpg",
  "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/noodles.jpg",
  "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/fruit-bowl.jpg",
  "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/smoothie.jpg",
  "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/pie.jpg",
  "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/omelette.jpg",
  "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/waffles.jpg",
  "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/shakshuka.jpg",
  "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/guacamole.jpg",
  "https://cdn.jsdelivr.net/gh/andrefsilva/food-demo-images@main/falafel.jpg"
];

/**
 * Make a small, stable, per-build seed based on REACT_APP_IMAGE_CACHE_BUST.
 */
function getBuildSeed() {
  const enabled = String(process.env.REACT_APP_IMAGE_CACHE_BUST || "true").toLowerCase() === "true";
  return enabled ? "1" : "";
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
 * PUBLIC_INTERFACE
 * Returns a guaranteed placeholder CDN food image URL by deterministic index (whitelist only).
 */
// PUBLIC_INTERFACE
export function getStrictFoodFallback(width = 1200, height = 675, idIndex = 0) {
  /** Returns a strict food placeholder URL from curated CDN set. */
  const idx = Math.abs(Number(idIndex || 0)) % CURATED_FOOD_WHITELIST.length;
  const base = CURATED_FOOD_WHITELIST[idx];
  // Append rid and optional v; note width/height are inherent in most URLs (Cloudinary variants already sized)
  const seed = getBuildSeed();
  const q = [`rid=${encodeURIComponent(String(idIndex))}`];
  if (seed) q.push(`v=${seed}`);
  // Some Cloudinary URLs may already contain query; use proper separator
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}${q.join("&")}`;
}

/**
 * PUBLIC_INTERFACE
 * Build a deterministic, food-only image URL using our curated whitelist.
 * Map recipe to an index via hash; ensures distinct image per recipe.
 */
// PUBLIC_INTERFACE
export function buildFoodImageUrl(recipe) {
  if (!recipe) {
    return getStrictFoodFallback(1200, 675, 0);
  }
  const seed = computeSeed(recipe);
  const idx = Math.abs(seed) % CURATED_FOOD_WHITELIST.length;
  const base = CURATED_FOOD_WHITELIST[idx];
  const buildSeed = getBuildSeed();
  const rid = encodeURIComponent(String(recipe.id || "unknown"));
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}rid=${rid}${buildSeed ? `&v=${buildSeed}` : ""}`;
}

/**
 * PUBLIC_INTERFACE
 * Decide best food image URL for a recipe:
 * - If recipe.imageUrl exists, return it (later normalization by consumer).
 * - Otherwise compute a deterministic curated URL.
 */
// PUBLIC_INTERFACE
export function resolveFoodImageUrl(recipe) {
  const src = recipe?.imageUrl;
  if (src) return src;
  return buildFoodImageUrl(recipe);
}

/**
 * PUBLIC_INTERFACE
 * Compute a deterministic fallback chain for a given recipe id/index:
 * 1) Primary curated URL (deterministic)
 * 2) Alternate curated URL (different deterministic index)
 * 3) Local placeholder asset (/assets/food-placeholder.jpg)
 */
// PUBLIC_INTERFACE
export function deterministicFallbacks(recipeOrId) {
  const idVal = typeof recipeOrId === "string" ? recipeOrId : (recipeOrId?.id || "unknown");
  const seed = typeof recipeOrId === "string" ? computeSeed({ id: recipeOrId }) : computeSeed(recipeOrId);
  const primaryIdx = Math.abs(seed) % CURATED_FOOD_WHITELIST.length;
  // Create a second index by mixing the hash to get a different slot deterministically
  const altIdx = Math.abs((seed * 131) ^ 0x9e3779b9) % CURATED_FOOD_WHITELIST.length;

  const primaryBase = CURATED_FOOD_WHITELIST[primaryIdx];
  const altBase = CURATED_FOOD_WHITELIST[altIdx];

  const buildSeed = getBuildSeed();
  const rid = encodeURIComponent(String(idVal));

  const pSep = primaryBase.includes("?") ? "&" : "?";
  const aSep = altBase.includes("?") ? "&" : "?";

  return {
    primary: `${primaryBase}${pSep}rid=${rid}${buildSeed ? `&v=${buildSeed}` : ""}`,
    curated: `${altBase}${aSep}rid=${rid}${buildSeed ? `&v=${buildSeed}` : ""}`,
    local: "/assets/food-placeholder.jpg",
  };
}
