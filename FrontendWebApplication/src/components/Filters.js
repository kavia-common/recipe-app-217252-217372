import React, { useEffect, useRef, useState } from "react";
import { Api } from "../api/client";
import "./filters.css";

// New top-level category values
const TOP_LEVEL_CATEGORIES = ["Veg", "Non-Veg", "Snacks", "Desserts"];

// PUBLIC_INTERFACE
export default function Filters({ value, onChange }) {
  /** Filter controls for recipe list, including unified search and top-level category chips. */
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

  function onTopLevelChipClick(val) {
    // toggle behavior: clicking the same chip clears it
    const current = (local.category || "").trim();
    const nextVal = current.toLowerCase() === val.toLowerCase() ? "" : val;
    updateField("category", nextVal);
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

      {/* Quick top-level category chips */}
      <div role="group" aria-label="Top-level category">
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {TOP_LEVEL_CATEGORIES.map((c) => {
            const active = (local.category || "").toLowerCase() === c.toLowerCase();
            return (
              <button
                key={c}
                type="button"
                className="btn btn-secondary"
                onClick={() => onTopLevelChipClick(c)}
                aria-pressed={active}
                aria-label={`${c} ${active ? "selected" : "not selected"}`}
                title={c}
                style={{
                  background: active ? "#374151" : undefined,
                  outlineOffset: 2,
                }}
              >
                {c}
              </button>
            );
          })}
          {local.category && TOP_LEVEL_CATEGORIES.some((t) => t.toLowerCase() === local.category.toLowerCase()) && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => updateField("category", "")}
              aria-label="Clear top-level category selection"
              title="Clear category"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <label>
        Category
        <select value={local.category || ""} onChange={(e) => updateField("category", e.target.value)} aria-label="Category filter">
          <option value="">All</option>
          {/* Include new top-level category options in dropdown too */}
          {TOP_LEVEL_CATEGORIES.map((c) => (
            <option key={`top-${c}`} value={c}>{c}</option>
          ))}
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
      <label htmlFor="sort-select">
        Sort
        <select
          id="sort-select"
          value={local.sort || ""}
          onChange={(e) => updateField("sort", e.target.value)}
          aria-label="Sort recipes"
        >
          {/* Prominent new options */}
          <option value="">Default</option>
          <option value="newest">Newest</option>
          <option value="most-liked">Most liked</option>
          <option value="fastest">Fastest (cook time)</option>
          {/* Keep existing options */}
          <option value="trending">Trending</option>
          <option value="featured">Featured</option>
          <option value="price">Price (low to high)</option>
        </select>
      </label>
    </form>
  );
}
