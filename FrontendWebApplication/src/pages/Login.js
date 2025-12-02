import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import ErrorMessage from "../components/ErrorMessage";
import Loading from "../components/Loading";
import { useNavigate, useLocation, Link } from "react-router-dom";

// PUBLIC_INTERFACE
export default function Login() {
  /** Login page with email/password form. */
  const { login, loading, isAuthenticated } = useContext(AuthContext);
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  async function onSubmit(e) {
    e.preventDefault();
    setErr(null);
    try {
      await login(form.email, form.password);
      navigate(from, { replace: true });
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
      <h1>Login</h1>
      <form onSubmit={onSubmit} aria-label="Login form">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" autoComplete="email" type="email" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
        <label htmlFor="password">Password</label>
        <input id="password" name="password" autoComplete="current-password" type="password" required value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
        <button className="btn" type="submit" style={{ marginTop: 12 }}>Login</button>
      </form>
      <p style={{ marginTop: 8 }}>
        No account? <Link to="/register">Register</Link>
      </p>
      <ErrorMessage error={err} />
    </main>
  );
}
