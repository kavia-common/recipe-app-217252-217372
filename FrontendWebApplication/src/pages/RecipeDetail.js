import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Api } from "../api/client";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import { AuthContext } from "../context/AuthContext";
import { normalizeImageUrl } from "../components/RecipeCard";
import { resolveFoodImageUrl, getStrictFoodFallback, deterministicFallbacks } from "../mocks/imageUtil";

// PUBLIC_INTERFACE
export default function RecipeDetail() {
  /** Detailed recipe view with admin actions conditionally rendered. */
  const { id } = useParams();
  const navigate = useNavigate();
  const { role, isAuthenticated } = useContext(AuthContext);

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // Precompute image-related hooks unconditionally to satisfy rules-of-hooks;
  // We'll only use them in the render when recipe is available.
  const initialHero = useMemo(() => {
    if (!recipe) return "/assets/food-placeholder.jpg";
    const base = resolveFoodImageUrl(recipe);
    const n = normalizeImageUrl(base || getStrictFoodFallback(1200, 675, recipe.id || id), recipe.id || id);
    return n || "/assets/food-placeholder.jpg";
  }, [recipe, id]);

  const fb = useMemo(() => deterministicFallbacks(recipe || { id }), [recipe, id]);
  const triedFallback = useRef(false);
  const [heroSrc, setHeroSrc] = useState(initialHero);
  const [finalTried, setFinalTried] = useState(false);

  // Keep heroSrc in sync when initialHero changes (e.g., after recipe loads)
  useEffect(() => {
    setHeroSrc(initialHero);
    // reset fallbacks when new recipe arrives
    triedFallback.current = false;
    setFinalTried(false);
  }, [initialHero]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Api.getRecipe(id)
      .then((res) => mounted && setRecipe(res))
      .catch((e) => mounted && setErr(e))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [id]);

  async function handleDelete() {
    if (!window.confirm("Delete this recipe?")) return;
    try {
      await Api.deleteRecipe(id);
      navigate("/recipes");
    } catch (e) {
      setErr(e);
    }
  }

  function onHeroError() {
    if (!triedFallback.current) {
      triedFallback.current = true;
      const next = fb.curated;
      if (next && next !== heroSrc) {
        setHeroSrc(normalizeImageUrl(next, (recipe && recipe.id) || id));
        return;
      }
    }
    if (!finalTried) {
      setFinalTried(true);
      setHeroSrc("/assets/food-placeholder.jpg");
    }
  }

  if (loading) return <Loading label="Loading recipe..." />;
  if (err) return <ErrorMessage error={err} />;
  if (!recipe) return <p role="status">Recipe not found.</p>;

  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

  return (
    <main className="container" role="main" style={{ padding: 16 }}>
      <button className="btn" onClick={() => navigate(-1)} aria-label="Go back">← Back</button>
      <h1 style={{ marginTop: 12 }}>{recipe.title}</h1>
      <figure>
        <img
          src={heroSrc}
          alt={recipe.title ? `${recipe.title} image` : "Recipe image"}
          style={{ width: "100%", maxWidth: 900, borderRadius: 12 }}
          onError={onHeroError}
        />
        {recipe.description && <figcaption style={{ color: "#555" }}>{recipe.description}</figcaption>}
      </figure>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", margin: "12px 0" }}>
        {recipe.category && <span className="chip">Category: {recipe.category}</span>}
        {recipe.cuisine && <span className="chip">Cuisine: {recipe.cuisine}</span>}
        {recipe.difficulty && <span className="chip">Difficulty: {recipe.difficulty}</span>}
        <span className="chip">Prep: {recipe.prepTime || 0}m</span>
        <span className="chip">Cook: {recipe.cookTime || 0}m</span>
        <span className="chip">Total: {totalTime}m</span>
      </div>

      <section aria-labelledby="ingredients-title" style={{ marginTop: 16 }}>
        <h2 id="ingredients-title">Ingredients</h2>
        <ul>
          {(recipe.ingredients || []).map((ing, idx) => (
            <li key={idx}>{ing}</li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="steps-title" style={{ marginTop: 16 }}>
        <h2 id="steps-title">Steps</h2>
        <ol>
          {(recipe.steps || []).map((step, idx) => (
            <li key={idx}>{step}</li>
          ))}
        </ol>
      </section>

      {role === "admin" && isAuthenticated && (
        <section aria-labelledby="admin-actions" style={{ marginTop: 24 }}>
          <h2 id="admin-actions">Admin Actions</h2>
          {/* Basic admin controls: delete; create/update would be separate forms */}
          <button className="btn" onClick={handleDelete} aria-label="Delete recipe">Delete</button>
        </section>
      )}
    </main>
  );
}
