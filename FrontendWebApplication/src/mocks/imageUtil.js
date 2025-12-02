//
// Utilities for deterministic, food-only mock images
//

/**
 * Known-good Unsplash food photo IDs used as strict fallbacks.
 * These are stable IDs of clear food imagery.
 */
const FOOD_FALLBACKS = [
  // Pizza slices on board
  "photo-1546549039-49d476f76c87",
  // Pancakes with berries
  "photo-1504674900247-0877df9cc836",
  // Avocado toast
  "photo-1523986371872-9d3ba2e2f642",
  // Bowl salad
  "photo-1512621776951-a57141f2eefd",
  // Burger
  "photo-1550547660-d9450f859349",
];

/**
 * PUBLIC_INTERFACE
 * Returns a guaranteed food placeholder Unsplash URL (no network API), with sizing.
 */
export function getStrictFoodFallback(width = 1200, height = 675, idIndex = 0) {
  /** Returns a strict food placeholder URL using a fixed Unsplash image id. */
  const idx = Math.abs(Number(idIndex || 0)) % FOOD_FALLBACKS.length;
  const id = FOOD_FALLBACKS[idx];
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&h=${height}&q=60`;
}

/**
 * Make a small, stable, per-build seed based on REACT_APP_IMAGE_CACHE_BUST.
 */
function getBuildSeed() {
  const enabled = String(process.env.REACT_APP_IMAGE_CACHE_BUST || "true").toLowerCase() === "true";
  return enabled ? "1" : "";
}

/**
 * PUBLIC_INTERFACE
 * Build a deterministic, food-only Unsplash source URL for a recipe using a constrained query.
 * - Always constrained to food-related keywords (food, meal, dish, ingredients, cuisine, category, dessert, salad, breakfast, pasta, soup, curry, grill, vegan).
 * - Uses recipe category/cuisine/title to make the query specific yet food-only.
 * - Appends a stable per-recipe rid=<id> and optional &v=<seed> for build cache busting.
 * - Include a 'sig' parameter for uniqueness across recipes to improve determinism.
 */
export function buildFoodImageUrl(recipe) {
  /**
   * Constructs a deterministic Unsplash Source URL constrained to food.
   * Uses source.unsplash.com which does not require API keys and serves random-ish images matching the query.
   */
  if (!recipe) {
    return getStrictFoodFallback();
  }
  const { id, title, category, cuisine } = recipe;
  const rid = id || "unknown";

  // Base food keywords
  const keywords = [
    "food",
    "meal",
    "dish",
    "ingredients",
    "cuisine",
    "dessert",
    "salad",
    "breakfast",
    "pasta",
    "soup",
    "curry",
    "grill",
    "vegan",
  ];

  // Add contextual keywords from recipe fields
  const ctx = [];
  if (category) ctx.push(category);
  if (cuisine) ctx.push(cuisine);
  if (title) ctx.push(title);

  // Build a query string ensuring it's clearly food-focused
  const q = [...keywords, ...ctx]
    .filter(Boolean)
    .map((s) => String(s).toLowerCase().trim().replace(/\s+/g, "+"))
    .join(",");

  // Use source.unsplash.com with search params
  // Dimensions fixed to 1200x675 (16:9)
  const base = `https://source.unsplash.com/1200x675/?${encodeURIComponent(q)}`;

  // Append rid and optional build seed and a deterministic sig
  let url = base;
  const hasQuery = url.includes("?");
  const sep = hasQuery ? "&" : "?";
  const buildSeed = getBuildSeed();

  url += `${sep}rid=${encodeURIComponent(rid)}&sig=${encodeURIComponent(rid)}`;
  if (buildSeed) {
    url += `&v=${buildSeed}`;
  }

  return url;
}

/**
 * PUBLIC_INTERFACE
 * Decide the best food image URL for a recipe:
 * - If recipe.imageUrl is present and appears food-related, normalize it by appending rid and optional v.
 * - Otherwise, compute via buildFoodImageUrl(recipe).
 * - If blocked, consumers can fall back to getStrictFoodFallback.
 */
export function resolveFoodImageUrl(recipe) {
  /** Compute an image URL prioritizing a supplied food-like URL, or generate a constrained food URL. */
  const buildSeed = getBuildSeed();

  const ensureParams = (url, rid = "unknown") => {
    try {
      const hasQuery = url.includes("?");
      const sep = hasQuery ? "&" : "?";
      const hasRid = /[?&]rid=/.test(url);
      const hasV = /[?&]v=/.test(url);
      let next = url;
      if (!hasRid) next += `${sep}rid=${encodeURIComponent(rid)}`;
      if (buildSeed && !hasV) next += `${hasRid || hasQuery ? "&" : "?"}v=${buildSeed}`;
      return next;
    } catch {
      return url;
    }
  };

  const rid = recipe?.id || "unknown";
  const src = recipe?.imageUrl || "";

  // Heuristic: check if provided URL seems food-like (contains known keywords)
  const foodishPattern = /(food|meal|dish|ingredients|cuisine|dessert|salad|breakfast|pasta|soup|curry|grill|vegan|pizza|burger|taco|ramen|pancake|toast|salmon|noodle|rice|bowl|cake|muffin|brownie|sauce)/i;

  if (src && foodishPattern.test(src)) {
    return ensureParams(src, rid);
  }

  // Otherwise, generate a food-only image URL
  return buildFoodImageUrl(recipe);
}
