import React, { useEffect, useMemo, useRef, useState } from "react";
import { Api } from "../api/client";
import Filters from "../components/Filters";
import RecipeGrid from "../components/RecipeGrid";
import Pagination from "../components/Pagination";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import { useNavigate, useSearchParams } from "react-router-dom";

// PUBLIC_INTERFACE
export default function RecipesList() {
  /** Recipe list with filters, unified search, and pagination. */
  const [params, setParams] = useState({ q: "", category: "", cuisine: "", difficulty: "", sort: "" });
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // client-side pagination
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const abortRef = useRef(null);

  useEffect(() => {
    // initialize from querystring including 'q'
    const initial = {
      q: searchParams.get("q") || "",
      category: searchParams.get("category") || "",
      cuisine: searchParams.get("cuisine") || "",
      difficulty: searchParams.get("difficulty") || "",
      sort: searchParams.get("sort") || "",
    };
    setParams(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLoading(true);
    setErr(null);
    // abort previous request if any
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    Api.listRecipes(params, { signal: controller.signal })
      .then((res) => setRecipes(res || []))
      .catch((e) => {
        if (e?.name === "AbortError") return;
        setErr(e);
      })
      .finally(() => setLoading(false));
    // update URL - include q and other filters
    const qsp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v) qsp.set(k, v);
    });
    setSearchParams(qsp);
    setPage(1);
    return () => controller.abort();
  }, [params, setSearchParams]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return recipes.slice(start, start + pageSize);
  }, [recipes, page]);

  function onSelect(r) {
    navigate(`/recipes/${encodeURIComponent(r.id)}`);
  }

  return (
    <main className="container" role="main">
      <h1 style={{ padding: "16px" }}>Browse Recipes</h1>
      <Filters value={params} onChange={setParams} />
      {loading && <Loading label="Loading recipes..." />}
      {err && <ErrorMessage error={err} />}
      {!loading && !err && (
        <>
          <RecipeGrid recipes={paginated} onSelect={onSelect} />
          <Pagination page={page} pageSize={pageSize} total={recipes.length} onPageChange={setPage} />
        </>
      )}
    </main>
  );
}
