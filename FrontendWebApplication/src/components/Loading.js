import React from "react";

// PUBLIC_INTERFACE
export default function Loading({ label = "Loading..." }) {
  /** Accessible loading indicator. */
  return (
    <div role="status" aria-live="polite" style={{ padding: 16 }}>
      {label}
    </div>
  );
}
