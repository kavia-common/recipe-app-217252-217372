import React, { useEffect, useState } from "react";
import { Api } from "../api/client";
import "./filters.css";

// PUBLIC_INTERFACE
export default function Filters({ value, onChange }) {
  /** Filter controls for recipe list. */
  const [categories, setCategories] = useState([]);
  const [local, setLocal] = useState(value || { category: "", cuisine: "", difficulty: "", sort: "" });

  useEffect(() => {
    Api.getCategories()
      .then((res) => setCategories(res || []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setLocal(value || { category: "", cuisine: "", difficulty: "", sort: "" });
  }, [value]);

  function updateField(field, val) {
    const next = { ...local, [field]: val };
    setLocal(next);
    onChange?.(next);
  }

  return (
    <form className="filters" aria-label="Recipe filters" onSubmit={(e) => e.preventDefault()}>
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
