import React from "react";

// PUBLIC_INTERFACE
export default function ErrorMessage({ error }) {
  /** Displays an accessible error message. */
  if (!error) return null;
  const message = error?.payload?.message || error?.message || "Something went wrong";
  return (
    <div role="alert" style={{ padding: 16, color: "#991b1b", background: "#fee2e2", borderRadius: 8 }}>
      {message}
    </div>
  );
}
