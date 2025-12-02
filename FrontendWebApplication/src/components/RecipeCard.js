import React from "react";
import "./recipe.css";

/**
 * Optionally normalize the incoming image URL.
 * Currently just returns the provided URL or a fallback if falsy.
 * Could be extended to append cache-busting or size params by recipe id if needed.
 */
function normalizeImageUrl(url) {
  return url || "https://via.placeholder.com/640x360?text=Recipe";
}

// PUBLIC_INTERFACE
export default function RecipeCard({ recipe, onClick }) {
  /** Accessible recipe card component. */
  const {
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
  const src = normalizeImageUrl(imageUrl);

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
