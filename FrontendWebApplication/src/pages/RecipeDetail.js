import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Api } from "../api/client";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import { AuthContext } from "../context/AuthContext";
import { normalizeImageUrl } from "../components/RecipeCard";
import { resolveFoodImageUrl, deterministicFallbacks } from "../mocks/imageUtil";

// PUBLIC_INTERFACE
export default function RecipeDetail() {
  /** Detailed recipe view with favorite toggle, robust image fallbacks, and admin delete. */
  const { id } = useParams();
  const navigate = useNavigate();
  const { role, isAuthenticated, isFavorite, toggleFavorite } = useContext(AuthContext);

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // Precompute image-related hooks unconditionally to satisfy rules-of-hooks.
  const fb = useMemo(() => deterministicFallbacks({ id }), [id]);

  const initialHero = useMemo(() => {
    if (!recipe) return "/assets/food-placeholder.jpg";
    const base = resolveFoodImageUrl(recipe);
    return normalizeImageUrl(base, recipe.id || id) || "/assets/food-placeholder.jpg";
  }, [recipe, id]);

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
    setErr(null);
    Api.getRecipe(id)
      .then((res) => mounted && setRecipe(res))
      .catch((e) => mounted && setErr(e))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [id]);

  // Show success banner if returned from edit
  const [banner, setBanner] = useState("");
  useEffect(() => {
    try {
      const qs = new URLSearchParams(window.location.search);
      if (qs.get("updated") === "1") {
        setBanner("Recipe updated successfully.");
        // remove the query param to avoid persistent banner
        qs.delete("updated");
        const path = window.location.pathname + (qs.toString() ? `?${qs.toString()}` : "");
        window.history.replaceState({}, "", path);
      }
    } catch {
      // ignore
    }
    // Also check history state toast
    if (window.history?.state?.usr?.toast) {
      setBanner(String(window.history.state.usr.toast));
    }
  }, []);

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
    // Stage 1: alternate curated URL
    if (!triedFallback.current) {
      triedFallback.current = true;
      const next = fb.curated;
      if (next && next !== heroSrc) {
        setHeroSrc(normalizeImageUrl(next, (recipe && recipe.id) || id));
        return;
      }
    }
    // Stage 2: local placeholder
    if (!finalTried) {
      setFinalTried(true);
      setHeroSrc("/assets/food-placeholder.jpg");
    }
  }

  if (loading) return <Loading label="Loading recipe..." />;
  if (err) return <ErrorMessage error={err} />;
  if (!recipe) return <p role="status">Recipe not found.</p>;

  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

  const favored = isAuthenticated ? isFavorite(recipe.id) : false;
  const onFavClick = () => {
    if (!isAuthenticated) return;
    toggleFavorite(recipe.id);
  };

  return (
    <main className="container" role="main" style={{ padding: 16 }}>
      <button className="btn" onClick={() => navigate(-1)} aria-label="Go back">
        ← Back
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
        <h1 style={{ margin: 0 }}>{recipe.title}</h1>
        {role === "admin" && isAuthenticated && (
          <button
            className="btn btn-secondary"
            type="button"
            onClick={() => navigate(`/recipes/${encodeURIComponent(id)}/edit`)}
            aria-label="Edit recipe"
            title="Edit recipe"
          >
            Edit
          </button>
        )}
        {isAuthenticated && (
          <button
            type="button"
            className="btn"
            onClick={onFavClick}
            aria-label={favored ? "Remove from favorites" : "Add to favorites"}
            aria-pressed={favored}
            title={favored ? "Remove from favorites" : "Add to favorites"}
            style={{ padding: "6px 8px" }}
          >
            {favored ? "❤️" : "🤍"}
          </button>
        )}
      </div>

      {banner && (
        <div role="status" style={{ padding: 12, background: "#d1fae5", color: "#065f46", borderRadius: 8, margin: "12px 0" }}>
          {banner}
        </div>
      )}
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
            <li key={idx}>{(ing || "").toString()}</li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="steps-title" style={{ marginTop: 16 }}>
        <h2 id="steps-title">Steps</h2>
        <ol>
          {(recipe.steps || []).map((step, idx) => (
            <li key={idx}>{(step || "").toString()}</li>
          ))}
        </ol>
      </section>

      {role === "admin" && isAuthenticated && (
        <section aria-labelledby="admin-actions" style={{ marginTop: 24, display: "flex", gap: 8, alignItems: "center" }}>
          <h2 id="admin-actions" style={{ marginRight: 12 }}>Admin Actions</h2>
          <button
            className="btn"
            onClick={() => navigate(`/recipes/${encodeURIComponent(id)}/edit`)}
            aria-label="Edit recipe"
            title="Edit recipe"
            type="button"
          >
            Edit
          </button>
          <button
            className="btn btn-secondary"
            onClick={async () => {
              if (!window.confirm("Are you sure you want to delete this recipe? This cannot be undone.")) return;
              try {
                await Api.deleteRecipe(id);
                // Navigate to recipes with banner message
                navigate(`/recipes`, { replace: true, state: { toast: "Recipe deleted." } });
              } catch (e) {
                setErr(e);
              }
            }}
            aria-label="Delete recipe"
            title="Delete recipe"
            type="button"
          >
            Delete
          </button>
        </section>
      )}
    </main>
  );
}
