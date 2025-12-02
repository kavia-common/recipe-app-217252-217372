import React from "react";
import RecipeCard from "./RecipeCard";
import "./recipe.css";

// PUBLIC_INTERFACE
export default function RecipeGrid({ recipes, onSelect }) {
  /** Displays a responsive grid of RecipeCard items. */
  if (!recipes?.length) {
    return <p role="status">No recipes found.</p>;
  }
  return (
    <section className="recipe-grid" aria-label="Recipe list">
      {recipes.map((r) => (
        <RecipeCard key={r.id} recipe={r} onClick={() => onSelect?.(r)} />
      ))}
    </section>
  );
}
