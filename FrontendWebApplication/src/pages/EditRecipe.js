import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Api } from "../api/client";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import RecipeForm from "../components/RecipeForm";

// PUBLIC_INTERFACE
export default function EditRecipe() {
  /**
   * Admin-only page to edit an existing recipe.
   * Pre-fills form with loaded recipe; on success, navigates to detail page with a success banner.
   */
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setErr(null);
    Api.getRecipe(id)
      .then((res) => {
        if (mounted) {
          setRecipe(res);
        }
      })
      .catch((e) => mounted && setErr(e))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [id]);

  async function handleSubmit(data) {
    setSaving(true);
    setErr(null);
    try {
      const updated = await Api.updateRecipe(id, data);
      // After update, navigate back to detail with a success flag
      navigate(`/recipes/${encodeURIComponent(id)}?updated=1`, { replace: true, state: { toast: "Recipe updated successfully." } });
      // Optionally keep local message
      setMessage("Recipe updated successfully.");
      // Not staying on page; navigation occurs.
      return updated;
    } catch (e) {
      setErr(e);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loading label="Loading recipe..." />;
  if (err) return <ErrorMessage error={err} />;
  if (!recipe) return <p role="status">Recipe not found.</p>;

  return (
    <main className="container" role="main" style={{ padding: 16, maxWidth: 800 }}>
      <button className="btn btn-secondary" type="button" onClick={() => navigate(-1)} aria-label="Go back">
        ← Back
      </button>
      <h1 style={{ marginTop: 12 }}>Edit Recipe</h1>
      {message && (
        <div role="status" style={{ padding: 12, background: "#d1fae5", color: "#065f46", borderRadius: 8, marginBottom: 12 }}>
          {message}
        </div>
      )}
      <RecipeForm initialValue={recipe} onSubmit={handleSubmit} submitting={saving} />
      <ErrorMessage error={err} />
    </main>
  );
}
