import React, { useContext, useMemo, useRef, useState } from "react";
import "./recipe.css";
import { AuthContext } from "../context/AuthContext";
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
    price,
  } = recipe;

  const totalTime = (prepTime || 0) + (cookTime || 0);

  const { isAuthenticated, isFavorite, toggleFavorite, role } = useContext(AuthContext);
  const favored = isAuthenticated ? isFavorite(id) : false;
  const onFavClick = (e) => {
    e.stopPropagation();
    toggleFavorite(id);
  };

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
    // Stage 1: try curated alternate (prefer same-category group as provided by deterministicFallbacks)
    if (!triedFallback.current) {
      triedFallback.current = true;
      const next = fallbacks.curated;
      if (next && next !== src) {
        setSrc(normalizeImageUrl(next, id));
        return;
      }
    }
    // Stage 2: final local placeholder; guard against loops
    if (!finalTried) {
      setFinalTried(true);
      if (src !== "/assets/food-placeholder.jpg") {
        setSrc("/assets/food-placeholder.jpg");
      }
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
        {isAuthenticated && (
          <button
            type="button"
            className="btn"
            onClick={onFavClick}
            aria-label={favored ? "Remove from favorites" : "Add to favorites"}
            aria-pressed={favored}
            title={favored ? "Remove from favorites" : "Add to favorites"}
            style={{ position: "absolute", top: 8, right: 8, padding: "6px 8px" }}
            onKeyDown={(e) => e.stopPropagation()}
          >
            {favored ? "❤️" : "🤍"}
          </button>
        )}
        {role === "admin" && (
          <div
            style={{ position: "absolute", top: 8, left: 8, display: "flex", gap: 6 }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <a
              href={`/recipes/${encodeURIComponent(id)}/edit`}
              className="btn btn-secondary"
              aria-label={`Edit ${title}`}
              title="Edit"
              onClick={(e) => e.stopPropagation()}
              style={{ padding: "4px 6px", fontSize: "0.8rem" }}
            >
              Edit
            </a>
            <button
              type="button"
              className="btn btn-secondary"
              aria-label={`Delete ${title}`}
              title="Delete"
              onClick={async (e) => {
                e.stopPropagation();
                // We cannot import Api here to avoid circular weight; but we can lazy import
                const mod = await import("../api/client");
                if (!window.confirm(`Delete recipe "${title}"?`)) return;
                try {
                  await mod.Api.deleteRecipe(id);
                  // naive refresh: reload current page so list re-fetches
                  window.location.reload();
                } catch (err) {
                  alert(err?.message || "Failed to delete");
                }
              }}
              style={{ padding: "4px 6px", fontSize: "0.8rem" }}
            >
              Delete
            </button>
          </div>
        )}
      </div>
      <div className="recipe-content">
        <h3 className="recipe-title">{title}</h3>
        <p className="recipe-desc">{description}</p>
        <div className="meta">
          {category && <span className="chip" aria-label={`Category ${category}`}>{category}</span>}
          {cuisine && <span className="chip" aria-label={`Cuisine ${cuisine}`}>{cuisine}</span>}
          {difficulty && <span className="chip" aria-label={`Difficulty ${difficulty}`}>{difficulty}</span>}
          <span className="chip" aria-label={`Total time ${totalTime} minutes`}>⏱ {totalTime}m</span>
          {typeof price === "number" && price >= 0 ? (
            <span className="chip" aria-label={`Price $${price.toFixed(2)}`}>💲 ${price.toFixed(2)}</span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
