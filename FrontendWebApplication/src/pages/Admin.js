import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

// PUBLIC_INTERFACE
export default function Admin() {
  /** Minimal admin landing page - admin-only controls are surfaced on detail pages too. */
  const { role } = useContext(AuthContext);
  if (role !== "admin") {
    return <main className="container" role="main" style={{ padding: 16 }}><p>Not authorized.</p></main>;
  }
  return (
    <main className="container" role="main" style={{ padding: 16 }}>
      <h1>Admin</h1>
      <p>Use recipe detail pages to manage recipes (delete/update). Future admin dashboards can live here.</p>
    </main>
  );
}
