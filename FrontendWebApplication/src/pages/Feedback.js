import React, { useContext, useEffect, useState } from "react";
import { Api } from "../api/client";
import { AuthContext } from "../context/AuthContext";
import ErrorMessage from "../components/ErrorMessage";
import Loading from "../components/Loading";

// PUBLIC_INTERFACE
export default function Feedback() {
  /** Authenticated feedback submission and admin list view. */
  const { isAuthenticated, role } = useContext(AuthContext);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState(null);
  const [feedbackList, setFeedbackList] = useState(null);
  const isAdmin = role === "admin";

  useEffect(() => {
    if (isAdmin) {
      Api.listFeedback()
        .then((res) => setFeedbackList(res || []))
        .catch(() => setFeedbackList([]));
    }
  }, [isAdmin]);

  async function onSubmit(e) {
    e.preventDefault();
    setErr(null);
    if (!isAuthenticated) {
      setErr(new Error("You must be logged in to submit feedback."));
      return;
    }
    setSubmitting(true);
    try {
      await Api.submitFeedback({ message });
      setMessage("");
      alert("Feedback submitted. Thank you!");
    } catch (e) {
      setErr(e);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="container" role="main" style={{ padding: 16, maxWidth: 680 }}>
      <h1>Feedback</h1>
      <section aria-labelledby="submit-feedback">
        <h2 id="submit-feedback">Submit your feedback</h2>
        <form onSubmit={onSubmit} aria-label="Feedback form">
          <label htmlFor="message">Message</label>
          <textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} rows={5} required />
          <button className="btn" type="submit" disabled={submitting} style={{ marginTop: 8 }}>
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </form>
        <ErrorMessage error={err} />
        {!isAuthenticated && <p style={{ marginTop: 8 }}>Please log in to submit feedback.</p>}
      </section>

      {isAdmin && (
        <section aria-labelledby="admin-feedback" style={{ marginTop: 24 }}>
          <h2 id="admin-feedback">All feedback (admin)</h2>
          {!feedbackList ? (
            <Loading label="Loading feedback..." />
          ) : feedbackList.length === 0 ? (
            <p role="status">No feedback yet.</p>
          ) : (
            <ul>
              {feedbackList.map((f) => (
                <li key={f.id}>
                  <div><strong>{f.userId}</strong> — {new Date(f.createdAt || Date.now()).toLocaleString()}</div>
                  <div>{f.message}</div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </main>
  );
}
