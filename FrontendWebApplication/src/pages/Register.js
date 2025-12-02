import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import ErrorMessage from "../components/ErrorMessage";
import Loading from "../components/Loading";
import { useNavigate, Link } from "react-router-dom";

// PUBLIC_INTERFACE
export default function Register() {
  /** Registration page with username/email/password form. */
  const { register, loading, isAuthenticated } = useContext(AuthContext);
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [err, setErr] = useState(null);
  const navigate = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setErr(null);
    try {
      await register(form.username, form.email, form.password);
      navigate("/", { replace: true });
    } catch (e) {
      setErr(e);
    }
  }

  if (loading) return <Loading />;
  if (isAuthenticated) {
    navigate("/");
    return null;
  }

  return (
    <main className="container" role="main" style={{ padding: 16, maxWidth: 480 }}>
      <h1>Register</h1>
      <form onSubmit={onSubmit} aria-label="Register form">
        <label htmlFor="username">Username</label>
        <input id="username" name="username" autoComplete="username" required value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} />
        <label htmlFor="email">Email</label>
        <input id="email" name="email" autoComplete="email" type="email" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
        <label htmlFor="password">Password</label>
        <input id="password" name="password" autoComplete="new-password" type="password" required value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
        <button className="btn" type="submit" style={{ marginTop: 12 }}>Create account</button>
      </form>
      <p style={{ marginTop: 8 }}>
        Have an account? <Link to="/login">Login</Link>
      </p>
      <ErrorMessage error={err} />
    </main>
  );
}
