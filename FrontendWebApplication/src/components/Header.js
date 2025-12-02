import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./header.css";

export default function Header() {
  const { isAuthenticated, user, role, logout, health } = useContext(AuthContext);

  return (
    <header className="site-header" role="banner">
      <nav className="navbar" aria-label="Main navigation">
        <div className="nav-left">
          <Link to="/" className="brand" aria-label="Recipe App Home">🍳 RecipeApp</Link>
          <Link to="/recipes" className="nav-link">Browse</Link>
          <Link to="/feedback" className="nav-link">Feedback</Link>
          {role === "admin" && (
            <Link to="/admin" className="nav-link">Admin</Link>
          )}
        </div>
        <div className="nav-right">
          <span className={`health ${health === "ok" ? "ok" : "bad"}`} aria-live="polite" title="API health">
            {health === "ok" ? "API: Healthy" : "API: Unavailable"}
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
