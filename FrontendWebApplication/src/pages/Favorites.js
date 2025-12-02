import React, { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Api } from "../api/client";
import RecipeGrid from "../components/RecipeGrid";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import { useNavigate, Link } from "react-router-dom";

/**
 * PUBLIC_INTERFACE
 * Favorites page: shows the user's favorited recipes using RecipeGrid.
 * In mock mode, resolves IDs via mock dataset; in live mode, attempts to fetch each recipe by ID.
 */
export default function Favorites() {
  const { favorites, isFavorite } = useContext(AuthContext);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setErr(null);
      try {
        // Fetch recipe details for each ID; ignore missing
        const list = await Promise.all(
          (favorites || []).map(async (id) => {
            try {
              const r = await Api.getRecipe(id);
              return r;
            } catch {
              return null;
            }
          })
        );
        if (mounted) setRecipes(list.filter(Boolean));
      } catch (e) {
        if (mounted) setErr(e);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [favorites]);

  const onSelect = (r) => {
    navigate(`/recipes/${encodeURIComponent(r.id)}`);
  };

  if (loading) return <Loading label="Loading favorites..." />;
  if (err) return <ErrorMessage error={err} />;

  return (
    <main className="container" role="main">
      <h1 style={{ padding: "16px" }}>Your Favorites</h1>
      {!favorites?.length ? (
        <div style={{ padding: 16 }}>
          <p role="status">You have no favorite recipes yet.</p>
          <p>
            Browse recipes to add some. <Link to="/recipes">Go to Browse</Link>
          </p>
        </div>
      ) : (
        <RecipeGrid recipes={recipes} onSelect={onSelect} />
      )}
    </main>
  );
}
