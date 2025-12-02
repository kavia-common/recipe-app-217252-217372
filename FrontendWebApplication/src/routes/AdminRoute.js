import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

// PUBLIC_INTERFACE
export default function AdminRoute({ children }) {
  /** Protects child routes by requiring authentication and admin role. */
  const { isAuthenticated, role } = useContext(AuthContext);
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (role !== "admin") {
    return <Navigate to="/" replace />;
  }
  return children;
}
