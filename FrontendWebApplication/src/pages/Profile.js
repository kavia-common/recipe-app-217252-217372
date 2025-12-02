import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Api } from "../api/client";
import ErrorMessage from "../components/ErrorMessage";
import Loading from "../components/Loading";

// PUBLIC_INTERFACE
export default function Profile() {
  /** Authenticated user profile page with update capability. */
  const { isAuthenticated, user: currentUser, refreshProfile } = useContext(AuthContext);
  const [form, setForm] = useState({ username: "", email: "" });
  const [err, setErr] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    setLoading(true);
    refreshProfile()
      .then((u) => {
        if (u) setForm({ username: u.username || "", email: u.email || "" });
      })
      .catch((e) => setErr(e))
      .finally(() => setLoading(false));
  }, [isAuthenticated, refreshProfile]);

  async function onSubmit(e) {
    e.preventDefault();
    setErr(null);
    setSaving(true);
    try {
      await Api.updateProfile(form);
      await refreshProfile();
      alert("Profile updated");
    } catch (e) {
      setErr(e);
    } finally {
      setSaving(false);
    }
  }

  if (!isAuthenticated) {
    return <main className="container" role="main" style={{ padding: 16 }}><p>Please log in to view your profile.</p></main>;
  }
  if (loading) return <Loading />;
  return (
    <main className="container" role="main" style={{ padding: 16, maxWidth: 520 }}>
      <h1>Profile</h1>
      <form onSubmit={onSubmit} aria-label="Profile form">
        <label htmlFor="username">Username</label>
        <input id="username" value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} />
        <label htmlFor="email">Email</label>
        <input id="email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
        <button className="btn" type="submit" disabled={saving} style={{ marginTop: 12 }}>
          {saving ? "Saving..." : "Save"}
        </button>
      </form>
      <ErrorMessage error={err} />
      {currentUser?.role && <p style={{ marginTop: 12 }}>Role: <strong>{currentUser.role}</strong></p>}
    </main>
  );
}
