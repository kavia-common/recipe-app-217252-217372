import React from "react";
import type { Recipe } from "../data/recipes";

/**
 * PUBLIC_INTERFACE
 * RecipeCard displays a single recipe with image, title, description, tags, and a View button.
 * Props:
 * - recipe: Recipe object containing title, image, description, and tags.
 * - onView?: optional callback when the View button is clicked/activated.
 * Returns:
 * - JSX.Element: Accessible card component.
 */
export default function RecipeCard({
  recipe,
  onView,
}: {
  recipe: Recipe;
  onView?: (id: string) => void;
}): JSX.Element {
  const handleView = (): void => {
    onView?.(recipe.id);
  };

  return (
    <li
      className="card"
      data-testid="recipe-card"
      role="listitem"
      aria-label={recipe.title}
    >
      <article className="card__content">
        <div className="card__media">
          <img
            src={recipe.image}
            alt={`Thumbnail of ${recipe.title}`}
            width={320}
            height={200}
            loading="lazy"
          />
        </div>
        <div className="card__body">
          <h3 className="card__title">{recipe.title}</h3>
          <p className="card__desc">{recipe.description}</p>
          <ul className="card__tags" aria-label="Tags">
            {recipe.tags.map((tag) => (
              <li key={tag} className="chip">
                <span className="chip__text">{tag}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="card__actions">
          <button
            type="button"
            className="btn btn--primary"
            onClick={handleView}
            aria-label={`View details for ${recipe.title}`}
          >
            View
          </button>
        </div>
      </article>
    </li>
  );
}
