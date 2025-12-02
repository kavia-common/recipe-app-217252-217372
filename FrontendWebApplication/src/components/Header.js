import React, { useContext, useMemo } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { getApiBase, isMockEnabled } from "../api/client";
import "./header.css";

export default function Header() {
  const { isAuthenticated, user, role, logout, health } = useContext(AuthContext);
  const apiBase = useMemo(() => getApiBase(), []);

  const mock = isMockEnabled();

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
        <div className="nav-right">
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
