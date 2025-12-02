import React, { useEffect, useMemo, useState } from "react";
import { Api, getApiBase, isMockEnabled } from "../api/client";

// PUBLIC_INTERFACE
export default function Diagnostics() {
  /** Diagnostics page to display resolved API base and check key endpoints. */
  const apiBase = useMemo(() => getApiBase(), []);
  const [results, setResults] = useState({
    health: { status: "pending" },
    recipes: { status: "pending" },
    recipeById: { status: "skipped" }, // will run if we find any id from list
  });

  useEffect(() => {
    let mounted = true;

    async function run() {
      const next = { health: {}, recipes: {}, recipeById: { status: "skipped" } };

      // health via Api
      try {
        const h = await Api.health();
        next.health = { status: h === "ok" ? "ok" : "error", message: isMockEnabled() ? "Mock mode: health is simulated" : undefined };
      } catch (e) {
        next.health = {
          status: "error",
          message: e?.message || "Unknown error",
          details: e?.payload || null,
          url: e?.url,
        };
      }

      // recipes via Api
      let firstId = null;
      try {
        const list = await Api.listRecipes();
        next.recipes = { status: "ok", count: Array.isArray(list) ? list.length : 0 };
        if (Array.isArray(list) && list.length > 0) {
          firstId = list[0]?.id ?? null;
        }
      } catch (e) {
        next.recipes = {
          status: "error",
          message: e?.message || "Unknown error",
          details: e?.payload || null,
          url: e?.url,
        };
      }

      // /recipes/{id} only when an id was found
      if (firstId) {
        try {
          const detail = await Api.getRecipe(firstId);
          next.recipeById = { status: "ok", id: firstId, title: detail?.title || "" };
        } catch (e) {
          next.recipeById = {
            status: "error",
            id: firstId,
            message: e?.message || "Unknown error",
            details: e?.payload || null,
          };
        }
      }

      if (mounted) setResults(next);
    }

    run();
    return () => {
      mounted = false;
    };
  }, []);

  function renderStatus(item) {
    if (!item) return null;
    if (item.status === "pending") return <span aria-live="polite">Checking…</span>;
    if (item.status === "ok") return <span style={{ color: "#065f46" }}>OK</span>;
    if (item.status === "skipped") return <span>Skipped</span>;
    return (
      <div style={{ color: "#991b1b" }}>
        <div><strong>Failed:</strong> {item.message}</div>
        {item.url && <div style={{ fontFamily: "monospace" }}>URL: {item.url}</div>}
        {item.details && <pre style={{ whiteSpace: "pre-wrap" }}>{typeof item.details === "string" ? item.details : JSON.stringify(item.details, null, 2)}</pre>}
      </div>
    );
  }

  return (
    <main className="container" role="main" style={{ padding: 16, maxWidth: 900 }}>
      <h1>Diagnostics</h1>
      <section aria-labelledby="api-base">
        <h2 id="api-base">Resolved API Base</h2>
        <p style={{ fontFamily: "monospace" }}>{apiBase}</p>
        <p>Environment precedence: REACT_APP_API_BASE → REACT_APP_BACKEND_URL → same-origin + "/api". Optional override: REACT_APP_API_VERSIONED_PATH (e.g., "/api/v1").</p>
      </section>

      {isMockEnabled() && (
        <div role="note" style={{ padding: 12, background: "#fef3c7", color: "#92400e", borderRadius: 8 }}>
          Mock mode is active. All requests are served from in-app mocks; no network calls are made.
        </div>
      )}
      <section aria-labelledby="checks" style={{ marginTop: 16 }}>
        <h2 id="checks">Endpoint Checks</h2>
        <ul>
          <li>
            GET <code>/health</code>: {renderStatus(results.health)}
          </li>
          <li>
            GET <code>/recipes</code>: {renderStatus(results.recipes)} {results.recipes?.count != null && <span>• count: {results.recipes.count}</span>}
          </li>
          <li>
            GET <code>/recipes/{`{id}`}</code>: {renderStatus(results.recipeById)} {results.recipeById?.id && <span>• id: {results.recipeById.id}</span>}
          </li>
        </ul>
      </section>
    </main>
  );
}
