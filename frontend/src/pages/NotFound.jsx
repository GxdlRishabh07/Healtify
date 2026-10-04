import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, textAlign: "center", padding: 24 }}>
      <div style={{ fontSize: "4rem", fontWeight: 700, color: "var(--teal)" }}>404</div>
      <h2 style={{ margin: 0 }}>Page not found</h2>
      <p style={{ color: "var(--slate)", maxWidth: 360 }}>The page you are looking for does not exist or has moved.</p>
      <Link to="/" className="btn btn-primary" style={{ marginTop: 8 }}>Go home</Link>
    </div>
  );
}
