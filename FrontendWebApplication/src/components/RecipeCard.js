import React from "react";
import "./recipe.css";
import { resolveFoodImageUrl, getStrictFoodFallback } from "../mocks/imageUtil";

/**
 * PUBLIC_INTERFACE
 * normalizeImageUrl ensures every image has a stable per-recipe cache-busting param.
 * - If input is falsy, provides a placeholder that also includes ?rid=<id>
 * - If input lacks ?rid, append ?rid=<id> (or &rid=) and optional &v=<seed> when enabled
 * Note: In mock mode, images are food-only via resolveFoodImageUrl; this function keeps cache-busting behavior.
 */
export function normalizeImageUrl(imageUrl, id) {
  /** Normalize/augment image URL with unique, stable cache-busting based on recipe id. */
  const buildSeed =
    String(process.env.REACT_APP_IMAGE_CACHE_BUST || "true").toLowerCase() === "true"
      ? "1"
      : "";
  const rid = id ? String(id) : "unknown";
  const ensureParams = (url) => {
    try {
      const hasQuery = url.includes("?");
      const sep = hasQuery ? "&" : "?";
      // only append rid if not present already
      const hasRid = /[?&]rid=/.test(url);
      const hasV = /[?&]v=/.test(url);
      let next = url;
      if (!hasRid) next += `${sep}rid=${encodeURIComponent(rid)}`;
      if (buildSeed && !hasV) next += `${hasRid || hasQuery ? "&" : "?"}v=${buildSeed}`;
      return next;
    } catch {
      // if URL parsing fails, return as-is
      return url;
    }
  };

  if (!imageUrl) {
    return ensureParams(getStrictFoodFallback(1200, 675, id), rid);
  }
  return ensureParams(imageUrl);
}

// PUBLIC_INTERFACE
export default function RecipeCard({ recipe, onClick }) {
  /** Accessible recipe card component. */
  const {
    id,
    title,
    description,
    imageUrl,
    category,
    cuisine,
    difficulty,
    prepTime,
    cookTime,
    isFeatured,
  } = recipe;

  const totalTime = (prepTime || 0) + (cookTime || 0);

  // Prefer explicit recipe.imageUrl if food-like/defined; otherwise compute deterministic food-only URL.
  let src = resolveFoodImageUrl(recipe);
  // As an extra guard, ensure stable rid/v additions
  src = normalizeImageUrl(src, id);

  return (
    <article
      className="recipe-card"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => (e.key === "Enter" ? onClick?.() : null)}
      aria-label={`Recipe card for ${title}`}
    >
      <div className="image-wrapper">
        <img
          src={src}
          alt={title ? `${title} image` : "Recipe image"}
          loading="lazy"
        />
        {isFeatured && <span className="badge">Featured</span>}
      </div>
      <div className="recipe-content">
        <h3 className="recipe-title">{title}</h3>
        <p className="recipe-desc">{description}</p>
        <div className="meta">
          {category && <span className="chip" aria-label={`Category ${category}`}>{category}</span>}
          {cuisine && <span className="chip" aria-label={`Cuisine ${cuisine}`}>{cuisine}</span>}
          {difficulty && <span className="chip" aria-label={`Difficulty ${difficulty}`}>{difficulty}</span>}
          <span className="chip" aria-label={`Total time ${totalTime} minutes`}>⏱ {totalTime}m</span>
        </div>
      </div>
    </article>
  );
}
