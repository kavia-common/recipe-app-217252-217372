import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { getApiBase, isMockEnabled } from "../api/client";
import "./header.css";

export default function Header() {
  const { isAuthenticated, user, role, logout, health } = useContext(AuthContext);
  const apiBase = useMemo(() => getApiBase(), []);
  const mock = isMockEnabled();

  // Unified search box in header that syncs with URL ?q=
  const location = useLocation();
  const navigate = useNavigate();
  const [headerQuery, setHeaderQuery] = useState("");

  // Sync local input when URL changes elsewhere
  useEffect(() => {
    try {
      const sp = new URLSearchParams(location.search);
      setHeaderQuery(sp.get("q") || "");
    } catch {
      // ignore
    }
  }, [location.search]);

  function applySearch(nextQ) {
    const sp = new URLSearchParams(location.search);
    if (nextQ) {
      sp.set("q", nextQ);
    } else {
      sp.delete("q");
    }
    // Ensure we route to /recipes for search context
    navigate({
      pathname: "/recipes",
      search: `?${sp.toString()}`,
    });
  }

  function onHeaderSubmit(e) {
    e.preventDefault();
    applySearch(headerQuery.trim());
  }

  function clearHeaderSearch() {
    setHeaderQuery("");
    applySearch("");
  }

  return (
    <header className="site-header" role="banner">
      <nav className="navbar" aria-label="Main navigation">
        <div className="nav-left">
          <Link to="/" className="brand" aria-label="Recipe App Home">🍳 RecipeApp</Link>
          <Link to="/recipes" className="nav-link">Browse</Link>
          <Link to="/feedback" className="nav-link">Feedback</Link>
          <Link to="/diagnostics" className="nav-link" title="API diagnostics">Diagnostics</Link>
          {role === "admin" && (
            <Link to="/admin" className="nav-link">Admin</Link>
          )}
        </div>
        <div className="nav-right" style={{ gap: 8 }}>
          {/* Header search */}
          <form onSubmit={onHeaderSubmit} role="search" aria-label="Search recipes" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <label htmlFor="global-search" className="sr-only" style={{ position: "absolute", left: -10000, top: "auto", width: 1, height: 1, overflow: "hidden" }}>
              Search recipes
            </label>
            <input
              id="global-search"
              type="search"
              value={headerQuery}
              onChange={(e) => setHeaderQuery(e.target.value)}
              placeholder="Search recipes (name, ingredient, category)"
              aria-label="Search recipes by name, ingredient, or category"
              aria-describedby="global-search-hint"
              style={{ minWidth: 220 }}
            />
            <div id="global-search-hint" className="sr-only" style={{ position: "absolute", left: -10000, top: "auto", width: 1, height: 1, overflow: "hidden" }}>
              Type to enter keywords. Press Enter to search. Use the clear button to reset.
            </div>
            {headerQuery && (
              <button
                type="button"
                className="btn btn-secondary"
                aria-label="Clear search"
                onClick={clearHeaderSearch}
                title="Clear search"
              >
                Clear
              </button>
            )}
            <button type="submit" className="btn" aria-label="Submit search">Search</button>
          </form>

          {mock && (
            <span className="nav-link" style={{ background: "#fef3c7", color: "#92400e", borderRadius: 8, padding: "4px 8px", fontWeight: 700 }}>
              Mock Mode
            </span>
          )}
          <span
            className={`health ${health === "ok" ? "ok" : "bad"}`}
            aria-live="polite"
            title={`API base: ${apiBase}`}
          >
            {mock ? "API: Mocked" : health === "ok" ? "API: Healthy" : "API: Unavailable"}
          </span>
          <span className="nav-link" aria-label="Resolved API base" style={{ opacity: 0.8 }}>
            {apiBase}
          </span>
          {isAuthenticated ? (
            <>
              <Link to="/profile" className="nav-link">Profile</Link>
              <button className="btn" onClick={logout} aria-label="Logout">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn">Login</Link>
              <Link to="/register" className="btn btn-secondary">Register</Link>
            </>
          )}
        </div>
      </nav>
      {user && (
        <div className="userbar" role="note" aria-label="Signed in user">
          Signed in as <strong>{user.username || user.email}</strong> ({user.role})
        </div>
      )}
    </header>
  );
}
