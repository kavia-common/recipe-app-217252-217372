import React from "react";
import "./pagination.css";

// PUBLIC_INTERFACE
export default function Pagination({ page, pageSize, total, onPageChange }) {
  /** Simple pagination controls. */
  const totalPages = Math.max(1, Math.ceil((total || 0) / (pageSize || 1)));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <nav className="pagination" aria-label="Pagination Navigation">
      <button className="btn" onClick={() => canPrev && onPageChange(page - 1)} disabled={!canPrev} aria-label="Previous page">Prev</button>
      <span aria-live="polite" className="page-info">
        Page {page} of {totalPages}
      </span>
      <button className="btn" onClick={() => canNext && onPageChange(page + 1)} disabled={!canNext} aria-label="Next page">Next</button>
    </nav>
  );
}
