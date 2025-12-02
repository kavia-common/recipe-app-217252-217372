import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";

/**
 * PUBLIC_INTERFACE
 * App is the root component for the Recipe App frontend.
 * It renders the navigation and top-level routes.
 *
 * Returns:
 * - JSX.Element: The application layout and routes.
 */
export default function App(): JSX.Element {
  return (
    <div className="app">
      <SiteHeader />
      <main className="main" role="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <footer className="footer" role="contentinfo">
        <small>Frontend container initialized successfully.</small>
      </footer>
    </div>
  );
}

function SiteHeader(): JSX.Element {
  return (
    <header className="header" role="banner">
      <div className="header__inner">
        <h1 className="brand">
          <Link to="/" className="brand__link">
            Recipe App
          </Link>
        </h1>
        <nav aria-label="Primary" className="nav">
          <Link to="/" className="nav__link">
            Home
          </Link>
          <Link to="/about" className="nav__link">
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}

function About(): JSX.Element {
  return (
    <section>
      <h2>About</h2>
      <p>This is a placeholder React + Vite application for the Recipe App frontend.</p>
    </section>
  );
}

function NotFound(): JSX.Element {
  return (
    <section>
      <h2>Page not found</h2>
      <p>The page you are looking for does not exist.</p>
    </section>
  );
}
