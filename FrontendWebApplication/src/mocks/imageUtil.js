/**
 * Utilities for deterministic, food-only mock images using hotlink-friendly sources.
 * Primary: picsum.photos seeded URLs (deterministic), food overlay curated set (optional).
 * Fallbacks: curated CDN-hosted static images, then local bundled placeholder asset.
 */

// Curated static food images hosted on a reliable CDN (GitHub raw over jsDelivr CDN).
// These are generic food photos and safe to hotlink for previews.
const CURATED_CDN = [
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
];

/**
 * Make a small, stable, per-build seed based on REACT_APP_IMAGE_CACHE_BUST.
 */
function getBuildSeed() {
  const enabled = String(process.env.REACT_APP_IMAGE_CACHE_BUST || "true").toLowerCase() === "true";
  return enabled ? "1" : "";
}

/**
 * Deterministic seed from recipe properties for picsum and for curated index selection.
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
 * Returns a guaranteed placeholder CDN food image URL by deterministic index.
 */
export function getStrictFoodFallback(width = 1200, height = 675, idIndex = 0) {
  /** Returns a strict food placeholder URL from curated CDN set. */
  const idx = Math.abs(Number(idIndex || 0)) % CURATED_CDN.length;
  const base = CURATED_CDN[idx];
  // Append size hints and light cache buster; CDN will ignore w/h but previews keep them distinct
  const seed = getBuildSeed();
  const q = [`rid=${encodeURIComponent(String(idIndex))}`];
  if (seed) q.push(`v=${seed}`);
  return `${base}?${q.join("&")}`;
}

/**
 * PUBLIC_INTERFACE
 * Build a deterministic, food-only image URL using picsum.photos seeded images.
 * We use 1200x675 (16:9) with /seed/<seed>/ for determinism.
 */
export function buildFoodImageUrl(recipe) {
  if (!recipe) {
    return getStrictFoodFallback(1200, 675, 0);
  }
  const seed = computeSeed(recipe);
  const buildSeed = getBuildSeed();
  let url = `https://picsum.photos/seed/${encodeURIComponent(String(seed))}/1200/675`;
  // Append rid & optional v for stable cache-busting across previews
  url += `?rid=${encodeURIComponent(String(recipe.id || "unknown"))}`;
  if (buildSeed) url += `&v=${buildSeed}`;
  return url;
}

/**
 * PUBLIC_INTERFACE
 * Decide best food image URL for a recipe:
 * - If recipe.imageUrl exists, return it (later normalization by consumer).
 * - Otherwise compute a deterministic picsum URL.
 */
export function resolveFoodImageUrl(recipe) {
  const src = recipe?.imageUrl;
  if (src) return src;
  return buildFoodImageUrl(recipe);
}

/**
 * PUBLIC_INTERFACE
 * Compute a deterministic fallback chain for a given recipe id/index:
 * 1) Deterministic picsum URL (primary for generated)
 * 2) Curated CDN URL by deterministic index
 * 3) Local placeholder asset
 */
export function deterministicFallbacks(recipeOrId) {
  const idVal = typeof recipeOrId === "string" ? recipeOrId : (recipeOrId?.id || "unknown");
  const seed = typeof recipeOrId === "string" ? computeSeed({ id: recipeOrId }) : computeSeed(recipeOrId);
  return {
    picsum: `https://picsum.photos/seed/${encodeURIComponent(String(seed))}/1200/675?rid=${encodeURIComponent(String(idVal))}${getBuildSeed() ? `&v=${getBuildSeed()}` : ""}`,
    curated: getStrictFoodFallback(1200, 675, seed),
    local: "/static/media/food-placeholder.jpg", // CRA will fingerprint; consumers should prefer "/assets/food-placeholder.jpg" if copied to public.
  };
}
