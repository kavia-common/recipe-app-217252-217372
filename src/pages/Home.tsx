import React from "react";
import RecipeCard from "../components/RecipeCard";
import { getRecipes } from "../data/recipes";

/**
 * PUBLIC_INTERFACE
 * Home page lists recipes in a responsive grid.
 * Renders:
 * - Page heading "Discover Recipes"
 * - A list (ul/li) of RecipeCard items
 */
export default function Home(): JSX.Element {
  const recipes = getRecipes();

  const onView = (id: string): void => {
    // Placeholder: in future, navigate to detail route
    // eslint-disable-next-line no-console
    console.log("View recipe", id);
  };

  return (
    <section aria-labelledby="home-heading">
      <header className="page-header">
        <h2 id="home-heading">Discover Recipes</h2>
        <p className="page-subtitle">
          Explore delicious ideas across cuisines and lifestyles.
        </p>
      </header>

      <ul className="grid" role="list" aria-label="Recipes">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} onView={onView} />
        ))}
      </ul>
    </section>
  );
}
