import React, { useMemo, useRef, useState } from "react";
import "./recipe.css";
import { resolveFoodImageUrl, deterministicFallbacks } from "../mocks/imageUtil";

/**
 * PUBLIC_INTERFACE
 * normalizeImageUrl: for remote URLs only, append cache-busting; local assets unchanged.
 */
export function normalizeImageUrl(imageUrl, id) {
  if (!imageUrl) return imageUrl;
  const isLocal = imageUrl.startsWith("/") || imageUrl.startsWith("./") || imageUrl.startsWith("../");
  if (isLocal) return imageUrl;
  const buildSeedEnabled = String(process.env.REACT_APP_IMAGE_CACHE_BUST || "true").toLowerCase() === "true";
  const rid = id ? String(id) : "unknown";
  try {
    const hasQuery = imageUrl.includes("?");
    const sep = hasQuery ? "&" : "?";
    const parts = [!/[?&]rid=/.test(imageUrl) ? `rid=${encodeURIComponent(rid)}` : ""];
    if (buildSeedEnabled && !/[?&]v=/.test(imageUrl)) parts.push("v=1");
    const toAdd = parts.filter(Boolean).join("&");
    return toAdd ? `${imageUrl}${sep}${toAdd}` : imageUrl;
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
    const primary = resolveFoodImageUrl(recipe);
    return normalizeImageUrl(primary, id);
  }, [recipe, id]);

  const triedFallback = useRef(false);
  const [src, setSrc] = useState(initialSrc);
  const [finalTried, setFinalTried] = useState(false);

  function onImgError() {
    if (!triedFallback.current) {
      triedFallback.current = true;
      const next = fallbacks.curated;
      if (next && next !== src) {
        setSrc(normalizeImageUrl(next, id));
        return;
      }
    }
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
