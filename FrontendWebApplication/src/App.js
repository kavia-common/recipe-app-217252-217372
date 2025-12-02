import React, { useEffect, useState } from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Header from "./components/Header";
import Home from "./pages/Home";
import RecipesList from "./pages/RecipesList";
import RecipeDetail from "./pages/RecipeDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Feedback from "./pages/Feedback";
import Admin from "./pages/Admin";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";
import Diagnostics from "./pages/Diagnostics";
import Favorites from "./pages/Favorites";
import EditRecipe from "./pages/EditRecipe";

// PUBLIC_INTERFACE
function App() {
  /** Main App with routing and theme toggle. */
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    /** Toggle between light/dark theme for accessibility preferences. */
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <div className="App">
      <AuthProvider>
        <Router>
          <Header />
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "light" ? "🌙 Dark" : "☀️ Light"}
          </button>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/recipes" element={<RecipesList />} />
            <Route path="/recipes/:id" element={<RecipeDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/feedback"
              element={
                <ProtectedRoute>
                  <Feedback />
                </ProtectedRoute>
              }
            />
            <Route
              path="/favorites"
              element={
                <ProtectedRoute>
                  <Favorites />
                </ProtectedRoute>
              }
            />
            <Route path="/admin" element={<Admin />} />
            <Route path="/diagnostics" element={<Diagnostics />} />
            <Route
              path="/recipes/:id/edit"
              element={
                <AdminRoute>
                  <EditRecipe />
                </AdminRoute>
              }
            />
            <Route
              path="*"
              element={
                <main style={{ padding: 16 }}>
                  <h1>404</h1>
                  <p>Page not found</p>
                </main>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </div>
  );
}

export default App;
