import React, { useEffect, useState } from "react";
import { Api } from "../api/client";
import RecipeGrid from "../components/RecipeGrid";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import { useNavigate } from "react-router-dom";

// PUBLIC_INTERFACE
export default function Home() {
  /** Home page with featured, trending, and new sections. */
  const [featured, setFeatured] = useState([]);
  const [trending, setTrending] = useState([]);
  const [newest, setNewest] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([
      Api.listRecipes({ sort: "featured" }),
      Api.listRecipes({ sort: "trending" }),
      Api.listRecipes({ sort: "newest" }),
    ])
      .then(([f, t, n]) => {
        if (!mounted) return;
        setFeatured(f || []);
        setTrending(t || []);
        setNewest(n || []);
      })
      .catch((e) => {
        if (mounted) setErr(e);
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  function onSelect(r) {
    navigate(`/recipes/${encodeURIComponent(r.id)}`);
  }

  if (loading) return <Loading label="Loading recipes..." />;
  if (err) return <ErrorMessage error={err} />;

  return (
    <main className="container" role="main">
      <section aria-labelledby="featured-title">
        <h2 id="featured-title" style={{ padding: "16px" }}>Featured</h2>
        <RecipeGrid recipes={featured} onSelect={onSelect} />
      </section>

      <section aria-labelledby="trending-title">
        <h2 id="trending-title" style={{ padding: "16px" }}>Trending</h2>
        <RecipeGrid recipes={trending} onSelect={onSelect} />
      </section>

      <section aria-labelledby="new-title">
        <h2 id="new-title" style={{ padding: "16px" }}>New</h2>
        <RecipeGrid recipes={newest} onSelect={onSelect} />
      </section>
    </main>
  );
}
