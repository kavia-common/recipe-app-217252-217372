import React, { useEffect, useMemo, useState } from "react";
import { Api, getApiBase, isMockEnabled } from "../api/client";
import { getMockModeInfo } from "../mocks/mockApi";

// PUBLIC_INTERFACE
export default function Diagnostics() {
  /** Diagnostics page to display resolved API base and check key endpoints. */
  const apiBase = useMemo(() => getApiBase(), []);
  const [results, setResults] = useState({
    health: { status: "pending" },
    recipes: { status: "pending" },
    recipeById: { status: "skipped" }, // will run if we find any id from list
  });

  const [testQ, setTestQ] = useState("");
  const [lastRequestInfo, setLastRequestInfo] = useState(null); // { url, params, mocked }

  // Helper: toggle mock mode using localStorage override and reload
  function setMockOverride(value) {
    try {
      if (value) {
        localStorage.setItem("use_mock_api", "true");
      } else {
        localStorage.removeItem("use_mock_api");
      }
    } catch {
      // ignore storage errors
    }
    // Ensure the new setting is applied on a fresh evaluation
    window.location.reload();
  }

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

      // recipes via Api (optionally with q)
      let firstId = null;
      try {
        const params = {};
        if (testQ) params.q = testQ;
        const list = await Api.listRecipes(params);
        next.recipes = { status: "ok", count: Array.isArray(list) ? list.length : 0 };
        if (Array.isArray(list) && list.length > 0) {
          firstId = list[0]?.id ?? null;
        }
        // Build a representation of the request info
        const qs = new URLSearchParams();
        Object.entries(params).forEach(([k, v]) => v && qs.append(k, v));
        const mocked = isMockEnabled();
        const base = mocked ? "(mocked)" : getApiBase();
        const finalUrl = mocked ? `/recipes${qs.toString() ? `?${qs.toString()}` : ""}` : `${(getApiBase() || "").replace(/\/+$/, "")}/recipes${qs.toString() ? `?${qs.toString()}` : ""}`;
        setLastRequestInfo({ url: finalUrl, params, mocked, base });
      } catch (e) {
        next.recipes = {
          status: "error",
          message: e?.message || "Unknown error",
          details: e?.payload || null,
          url: e?.url,
        };
        setLastRequestInfo(null);
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
  }, [testQ]);

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

  const mockInfo = useMemo(() => {
    try { return getMockModeInfo(); } catch { return { enabled: isMockEnabled(), reason: "unknown" }; }
  }, []);

  return (
    <main className="container" role="main" style={{ padding: 16, maxWidth: 900 }}>
      <h1>Diagnostics</h1>

      <section aria-labelledby="mock-mode">
        <h2 id="mock-mode">Mock Mode</h2>
        <p>
          <strong>Status:</strong> {mockInfo.enabled ? <span style={{ color: "#065f46" }}>ON</span> : <span style={{ color: "#991b1b" }}>OFF</span>}
          {" "}· <strong>Reason:</strong> {mockInfo.reason}
        </p>
        {mockInfo.enabled ? (
          <div role="note" style={{ padding: 12, background: "#fef3c7", color: "#92400e", borderRadius: 8 }}>
            Mock mode is active. All API calls are served from in-app mocks; no real network requests are made.
            <div style={{ marginTop: 8 }}>
              <button className="btn btn-secondary" type="button" onClick={() => setMockOverride(false)} aria-label="Disable mock mode">
                Disable Mock Mode
              </button>
            </div>
          </div>
        ) : (
          <div style={{ color: "#6b7280" }}>
            <p>
              To enable mock mode, you can:
            </p>
            <ul>
              <li>Set REACT_APP_USE_MOCK_API=true at build time, or</li>
              <li>Add <code>?mock=true</code> to the URL and reload, or</li>
              <li>Use the button below (stores local override in localStorage).</li>
            </ul>
            <button className="btn" type="button" onClick={() => setMockOverride(true)} aria-label="Enable mock mode">
              Enable Mock Mode Now
            </button>
          </div>
        )}
      </section>

      <section aria-labelledby="api-base" style={{ marginTop: 12 }}>
        <h2 id="api-base">Resolved API Base</h2>
        <p style={{ fontFamily: "monospace" }}>{apiBase}</p>
        <p>Environment precedence: REACT_APP_API_BASE → REACT_APP_BACKEND_URL → same-origin + "/api". Optional override: REACT_APP_API_VERSIONED_PATH (e.g., "/api/v1").</p>
      </section>

      <section aria-labelledby="checks" style={{ marginTop: 16 }}>
        <h2 id="checks">Endpoint Checks</h2>
        <div style={{ marginBottom: 12 }}>
          <form onSubmit={(e) => { e.preventDefault(); /* retrigger effect */ setResults((r) => ({ ...r, recipes: { status: "pending" }, recipeById: { status: "skipped" } })); }}>
            <label htmlFor="diag-q">Quick test for /recipes with q</label>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <input
                id="diag-q"
                type="search"
                value={testQ}
                onChange={(e) => setTestQ(e.target.value)}
                placeholder="e.g., chicken, Italian, dessert"
                aria-label="Test search term for recipes endpoint"
                style={{ maxWidth: 360 }}
              />
              <button className="btn" type="button" onClick={() => {
                // re-run checks with current q
                setResults({ health: { status: "pending" }, recipes: { status: "pending" }, recipeById: { status: "skipped" } });
              }}>
                Run test
              </button>
              {testQ && (
                <button className="btn btn-secondary" type="button" aria-label="Clear test term" onClick={() => setTestQ("")}>
                  Clear
                </button>
              )}
            </div>
          </form>

          {/* Quick buttons to test top-level categories via category query param */}
          <div role="group" aria-label="Test category parameter" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
            {["Veg", "Non-Veg", "Snacks", "Desserts"].map((c) => (
              <button
                key={c}
                className="btn btn-secondary"
                type="button"
                onClick={() => {
                  // Trigger a fetch with category set; we reuse Api.listRecipes in effect: set testQ to a unique token and back to re-run
                  // Instead we run inline here for clarity and update lastRequestInfo/results
                  setResults({ health: { status: "pending" }, recipes: { status: "pending" }, recipeById: { status: "skipped" } });
                  (async () => {
                    try {
                      const list = await Api.listRecipes({ category: c });
                      setResults((prev) => ({ ...prev, recipes: { status: "ok", count: Array.isArray(list) ? list.length : 0 } }));
                      const qs = new URLSearchParams();
                      qs.set("category", c);
                      const mocked = isMockEnabled();
                      const base = mocked ? "(mocked)" : getApiBase();
                      const finalUrl = mocked ? `/recipes?${qs.toString()}` : `${(getApiBase() || "").replace(/\/+$/, "")}/recipes?${qs.toString()}`;
                      setLastRequestInfo({ url: finalUrl, params: { category: c }, mocked, base });
                      if (Array.isArray(list) && list.length > 0) {
                        const id = list[0].id;
                        try {
                          const detail = await Api.getRecipe(id);
                          setResults((prev) => ({ ...prev, recipeById: { status: "ok", id, title: detail?.title || "" } }));
                        } catch (e) {
                          setResults((prev) => ({ ...prev, recipeById: { status: "error", id, message: e?.message || "Error" } }));
                        }
                      }
                    } catch (e) {
                      setResults((prev) => ({ ...prev, recipes: { status: "error", message: e?.message || "Error", url: e?.url, details: e?.payload } }));
                    }
                  })();
                }}
                aria-label={`Run /recipes with category=${c}`}
              >
                category={c}
              </button>
            ))}
          </div>

          {lastRequestInfo && (
            <div style={{ marginTop: 8, fontSize: "0.9rem" }}>
              <div><strong>Request:</strong> <code>{lastRequestInfo.url}</code></div>
              <div><strong>Mode:</strong> {lastRequestInfo.mocked ? "mocked" : "live"} {lastRequestInfo.base ? `• base: ${lastRequestInfo.base}` : null}</div>
              {lastRequestInfo.params && Object.keys(lastRequestInfo.params).length > 0 && (
                <div><strong>Criteria:</strong> {Object.entries(lastRequestInfo.params).map(([k, v]) => `${k}=${v}`).join(", ")}</div>
              )}
            </div>
          )}
        </div>
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
