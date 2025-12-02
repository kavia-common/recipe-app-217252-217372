import React from "react";
import { Routes, Route, Link } from "react-router-dom";

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
      <header className="header" role="banner">
        <h1>Recipe App</h1>
        <nav aria-label="Primary" className="nav">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
        </nav>
      </header>

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

function Home(): JSX.Element {
  return (
    <section>
      <h2>Welcome</h2>
      <p>
        If you are seeing this, the preview is working and the app is rendering content. Replace this
        with real recipe UI.
      </p>
    </section>
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
