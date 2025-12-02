import React, { useEffect, useMemo, useState } from "react";

/**
 * PUBLIC_INTERFACE
 * RecipeForm: Reusable form for creating/updating recipes with accessible
 * inputs and list editors for ingredients and steps.
 */
export default function RecipeForm({ initialValue, onSubmit, submitting }) {
  const [form, setForm] = useState(() => ({
    title: "",
    description: "",
    imageUrl: "",
    category: "",
    difficulty: "",
    cuisine: "",
    prepTime: 0,
    cookTime: 0,
    isFeatured: false,
    ingredients: [""],
    steps: [""],
    price: undefined,
    ...(initialValue || {}),
  }));

  useEffect(() => {
    if (!initialValue) return;
    setForm((f) => ({
      ...f,
      ...initialValue,
      ingredients: normalizeArray(initialValue.ingredients),
      steps: normalizeArray(initialValue.steps),
      prepTime: toNum(initialValue.prepTime),
      cookTime: toNum(initialValue.cookTime),
      isFeatured: !!initialValue.isFeatured,
      price: toPrice(initialValue.price),
    }));
  }, [initialValue]);

  function toNum(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }

  function toPrice(v) {
    if (v === undefined || v === null || v === "") return undefined;
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 ? Number(n.toFixed(2)) : undefined;
  }

  function normalizeArray(a) {
    if (!Array.isArray(a) || a.length === 0) return [""];
    return a.map((x) => (x == null ? "" : String(x)));
  }

  function updateField(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function updateListField(field, idx, value) {
    setForm((f) => {
      const arr = Array.isArray(f[field]) ? [...f[field]] : [""];
      arr[idx] = value;
      return { ...f, [field]: arr };
    });
  }

  function addListItem(field) {
    setForm((f) => {
      const arr = Array.isArray(f[field]) ? [...f[field]] : [];
      return { ...f, [field]: [...arr, ""] };
    });
  }

  function removeListItem(field, idx) {
    setForm((f) => {
      const arr = Array.isArray(f[field]) ? [...f[field]] : [];
      const next = arr.filter((_, i) => i !== idx);
      return { ...f, [field]: next.length > 0 ? next : [""] };
    });
  }

  const errors = useMemo(() => {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required.";
    if ((form.ingredients || []).filter((s) => s.trim()).length === 0) e.ingredients = "At least one ingredient is required.";
    if ((form.steps || []).filter((s) => s.trim()).length === 0) e.steps = "At least one step is required.";
    if (form.prepTime < 0) e.prepTime = "Prep time must be 0 or greater.";
    if (form.cookTime < 0) e.cookTime = "Cook time must be 0 or greater.";
    if (form.price !== undefined && !(Number.isFinite(Number(form.price)) && Number(form.price) >= 0)) {
      e.price = "Price must be a non-negative number.";
    }
    return e;
  }, [form]);

  function handleSubmit(e) {
    e.preventDefault();
    if (Object.keys(errors).length > 0) {
      const firstKey = Object.keys(errors)[0];
      const el = document.getElementById(`field-${firstKey}`);
      if (el && typeof el.focus === "function") el.focus();
      return;
    }
    const cleaned = {
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      imageUrl: (form.imageUrl || "").trim(),
      category: (form.category || "").trim(),
      difficulty: (form.difficulty || "").trim(),
      cuisine: (form.cuisine || "").trim(),
      prepTime: toNum(form.prepTime),
      cookTime: toNum(form.cookTime),
      isFeatured: !!form.isFeatured,
      ingredients: (form.ingredients || []).map((s) => s.trim()).filter(Boolean),
      steps: (form.steps || []).map((s) => s.trim()).filter(Boolean),
      // Only include price when valid (optional)
      ...(form.price !== undefined && form.price !== "" && Number(form.price) >= 0
        ? { price: Number(Number(form.price).toFixed(2)) }
        : { price: undefined }),
    };
    onSubmit?.(cleaned);
  }

  return (
    <form onSubmit={handleSubmit} aria-label="Recipe form" style={{ display: "grid", gap: 12 }}>
      <div>
        <label htmlFor="field-title">Title</label>
        <input
          id="field-title"
          type="text"
          value={form.title}
          onChange={(e) => updateField("title", e.target.value)}
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? "err-title" : undefined}
          required
        />
        {errors.title && (
          <div id="err-title" role="alert" style={{ color: "#991b1b" }}>
            {errors.title}
          </div>
        )}
      </div>

      <div>
        <label htmlFor="field-description">Description</label>
        <textarea
          id="field-description"
          rows={3}
          value={form.description}
          onChange={(e) => updateField("description", e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="field-imageUrl">Image URL</label>
        <input
          id="field-imageUrl"
          type="url"
          value={form.imageUrl || ""}
          onChange={(e) => updateField("imageUrl", e.target.value)}
          placeholder="https://example.com/your-image.jpg (optional)"
        />
      </div>

      <div>
        <label htmlFor="field-category">Category</label>
        <input
          id="field-category"
          type="text"
          value={form.category || ""}
          onChange={(e) => updateField("category", e.target.value)}
          placeholder="e.g., Dinner, Breakfast, Dessert"
        />
      </div>

      <div>
        <label htmlFor="field-difficulty">Difficulty</label>
        <select
          id="field-difficulty"
          value={form.difficulty || ""}
          onChange={(e) => updateField("difficulty", e.target.value)}
        >
          <option value="">Select</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      <div>
        <label htmlFor="field-cuisine">Cuisine</label>
        <input
          id="field-cuisine"
          type="text"
          value={form.cuisine || ""}
          onChange={(e) => updateField("cuisine", e.target.value)}
          placeholder="e.g., Italian, Mexican"
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label htmlFor="field-prepTime">Prep Time (minutes)</label>
          <input
            id="field-prepTime"
            type="number"
            min="0"
            value={form.prepTime}
            onChange={(e) => updateField("prepTime", toNum(e.target.value))}
            aria-invalid={!!errors.prepTime}
            aria-describedby={errors.prepTime ? "err-prep" : undefined}
          />
          {errors.prepTime && (
            <div id="err-prep" role="alert" style={{ color: "#991b1b" }}>
              {errors.prepTime}
            </div>
          )}
        </div>
        <div>
          <label htmlFor="field-cookTime">Cook Time (minutes)</label>
          <input
            id="field-cookTime"
            type="number"
            min="0"
            value={form.cookTime}
            onChange={(e) => updateField("cookTime", toNum(e.target.value))}
            aria-invalid={!!errors.cookTime}
            aria-describedby={errors.cookTime ? "err-cook" : undefined}
          />
          {errors.cookTime && (
            <div id="err-cook" role="alert" style={{ color: "#991b1b" }}>
              {errors.cookTime}
            </div>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="field-price">Price (USD)</label>
        <input
          id="field-price"
          type="number"
          min="0"
          step="0.01"
          value={form.price ?? ""}
          onChange={(e) => updateField("price", e.target.value === "" ? undefined : Number(e.target.value))}
          aria-invalid={!!errors.price}
          aria-describedby={`price-help${errors.price ? " err-price" : ""}`}
          placeholder="e.g., 12.99 (optional)"
        />
        <div id="price-help" style={{ fontSize: "0.85rem", color: "#6b7280" }}>
          Optional. Enter a non-negative amount in USD (e.g., 3.99).
        </div>
        {errors.price && (
          <div id="err-price" role="alert" style={{ color: "#991b1b" }}>
            {errors.price}
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          id="field-featured"
          type="checkbox"
          checked={!!form.isFeatured}
          onChange={(e) => updateField("isFeatured", e.target.checked)}
        />
        <label htmlFor="field-featured">Featured</label>
      </div>

      <fieldset>
        <legend>Ingredients</legend>
        {errors.ingredients && (
          <div id="err-ingredients" role="alert" style={{ color: "#991b1b" }}>
            {errors.ingredients}
          </div>
        )}
        <ul aria-describedby={errors.ingredients ? "err-ingredients" : undefined} style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
          {(form.ingredients || []).map((ing, idx) => (
            <li key={`ing-${idx}`} style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                value={ing}
                onChange={(e) => updateListField("ingredients", idx, e.target.value)}
                aria-label={`Ingredient ${idx + 1}`}
              />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => removeListItem("ingredients", idx)}
                aria-label={`Remove ingredient ${idx + 1}`}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="btn"
          onClick={() => addListItem("ingredients")}
          aria-label="Add ingredient"
          style={{ marginTop: 8 }}
        >
          Add ingredient
        </button>
      </fieldset>

      <fieldset>
        <legend>Steps</legend>
        {errors.steps && (
          <div id="err-steps" role="alert" style={{ color: "#991b1b" }}>
            {errors.steps}
          </div>
        )}
        <ol style={{ paddingLeft: 18 }}>
          {(form.steps || []).map((step, idx) => (
            <li key={`step-${idx}`} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <input
                type="text"
                value={step}
                onChange={(e) => updateListField("steps", idx, e.target.value)}
                aria-label={`Step ${idx + 1}`}
              />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => removeListItem("steps", idx)}
                aria-label={`Remove step ${idx + 1}`}
              >
                Remove
              </button>
            </li>
          ))}
        </ol>
        <button
          type="button"
          className="btn"
          onClick={() => addListItem("steps")}
          aria-label="Add step"
        >
          Add step
        </button>
      </fieldset>

      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn" type="submit" disabled={!!Object.keys(errors).length || submitting} aria-disabled={!!Object.keys(errors).length || submitting}>
          {submitting ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
