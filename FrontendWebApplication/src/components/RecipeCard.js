import React, { useMemo, useRef, useState } from "react";
import "./recipe.css";
import { resolveFoodImageUrl, getStrictFoodFallback, deterministicFallbacks } from "../mocks/imageUtil";

/**
 * PUBLIC_INTERFACE
 * normalizeImageUrl ensures every image has a stable per-recipe cache-busting param.
 * - For remote URLs: append ?rid=<id> and optional &v=<seed> (when enabled).
 * - For local/static assets (/, ./, ../): DO NOT append cache-busting to avoid breaking caching.
 */
export function normalizeImageUrl(imageUrl, id) {
  /** Normalize/augment image URL with unique, stable cache-busting based on recipe id for remote URLs only. */
  if (!imageUrl) return imageUrl;
  const isLocal = imageUrl.startsWith("/") || imageUrl.startsWith("./") || imageUrl.startsWith("../");
  if (isLocal) return imageUrl;
  const buildSeed =
    String(process.env.REACT_APP_IMAGE_CACHE_BUST || "true").toLowerCase() === "true"
      ? "1"
      : "";
  const rid = id ? String(id) : "unknown";
  try {
    const hasQuery = imageUrl.includes("?");
    const sep = hasQuery ? "&" : "?";
    const hasRid = /[?&]rid=/.test(imageUrl);
    const hasV = /[?&]v=/.test(imageUrl);
    let next = imageUrl;
    if (!hasRid) next += `${sep}rid=${encodeURIComponent(rid)}`;
    if (buildSeed && !hasV) next += `${hasRid || hasQuery ? "&" : "?"}v=${buildSeed}`;
    return next;
  } catch {
    return imageUrl;
  }
}

// PUBLIC_INTERFACE
export default function RecipeCard({ recipe, onClick }) {
  /** Accessible recipe card component with robust image fallbacks. */
  const {
    id,
    title,
    description,
    category,
    cuisine,
    difficulty,
    prepTime,
    cookTime,
    isFeatured,
  } = recipe;

  const totalTime = (prepTime || 0) + (cookTime || 0);

  // Compute deterministic fallbacks once per recipe
  const fallbacks = useMemo(() => deterministicFallbacks(recipe), [recipe]);

  const initialSrc = useMemo(() => {
    const base = resolveFoodImageUrl(recipe);
    // Primary = curated deterministic URL; if recipe has explicit imageUrl use it, else buildFoodImageUrl provides curated
    const primary = base || getStrictFoodFallback(1200, 675, id);
    return normalizeImageUrl(primary, id);
  }, [recipe, id]);

  const triedFallback = useRef(false);
  const [src, setSrc] = useState(initialSrc);
  const [finalTried, setFinalTried] = useState(false);

  function onImgError() {
    // Stage 1: alternate curated URL (different deterministic index)
    if (!triedFallback.current) {
      triedFallback.current = true;
      const next = fallbacks.curated;
      if (next && next !== src) {
        setSrc(normalizeImageUrl(next, id));
        return;
      }
    }
    // Stage 2: local placeholder asset; ensure we don't loop
    if (!finalTried) {
      setFinalTried(true);
      setSrc("/assets/food-placeholder.jpg");
    }
  }

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
          onError={onImgError}
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
