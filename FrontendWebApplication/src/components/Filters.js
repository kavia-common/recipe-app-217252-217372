import React, { useEffect, useRef, useState } from "react";
import { Api } from "../api/client";
import "./filters.css";

// PUBLIC_INTERFACE
export default function Filters({ value, onChange }) {
  /** Filter controls for recipe list, including unified search. */
  const [categories, setCategories] = useState([]);
  const [local, setLocal] = useState(value || { q: "", category: "", cuisine: "", difficulty: "", sort: "" });

  const debounceRef = useRef(null);

  useEffect(() => {
    Api.getCategories()
      .then((res) => setCategories(res || []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setLocal(value || { q: "", category: "", cuisine: "", difficulty: "", sort: "" });
  }, [value]);

  function updateField(field, val, options = {}) {
    const next = { ...local, [field]: val };
    setLocal(next);

    // Debounce only for search q; others propagate immediately
    if (field === "q") {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => onChange?.(next), options.debounceMs ?? 300);
    } else {
      onChange?.(next);
    }
  }

  return (
    <form className="filters" aria-label="Recipe filters" onSubmit={(e) => e.preventDefault()}>
      <label>
        Search
        <div style={{ display: "flex", gap: 6 }}>
          <input
            type="search"
            value={local.q || ""}
            onChange={(e) => updateField("q", e.target.value, { debounceMs: 300 })}
            placeholder="Search recipes (name, ingredient, category)"
            aria-label="Search recipes by name, ingredient, or category"
          />
          {local.q ? (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => updateField("q", "", { debounceMs: 0 })}
              aria-label="Clear search"
              title="Clear search"
            >
              Clear
            </button>
          ) : null}
        </div>
      </label>
      <label>
        Category
        <select value={local.category || ""} onChange={(e) => updateField("category", e.target.value)} aria-label="Category filter">
          <option value="">All</option>
          {categories.map((c) => (
            <option key={c.id || c.name} value={c.name}>{c.name}</option>
          ))}
        </select>
      </label>
      <label>
        Cuisine
        <input type="text" value={local.cuisine || ""} onChange={(e) => updateField("cuisine", e.target.value)} placeholder="e.g., Italian" aria-label="Cuisine filter" />
      </label>
      <label>
        Difficulty
        <select value={local.difficulty || ""} onChange={(e) => updateField("difficulty", e.target.value)} aria-label="Difficulty filter">
          <option value="">All</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </label>
      <label>
        Sort
        <select value={local.sort || ""} onChange={(e) => updateField("sort", e.target.value)} aria-label="Sort">
          <option value="">Default</option>
          <option value="newest">Newest</option>
          <option value="trending">Trending</option>
          <option value="featured">Featured</option>
        </select>
      </label>
    </form>
  );
}
