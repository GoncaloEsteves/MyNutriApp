import { useState } from "react";
import { C } from "../utils/consts";

export function HomeCard({ icon, title, description, cta, onClick, accent }) {
  const [hov, setHov] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: C.white,
        border: `2px solid ${hov ? accent : C.border}`,
        borderRadius: 16,
        padding: "40px 36px",
        cursor: "pointer",
        textAlign: "left",
        flex: "1 1 280px",
        maxWidth: 360,
        display: "flex",
        flexDirection: "column",
        gap: 16,
        boxShadow: hov ? `0 8px 28px rgba(0,0,0,0.10)` : "0 2px 8px rgba(0,0,0,0.05)",
        transition: "border-color 0.18s, box-shadow 0.18s, transform 0.18s",
        transform: hov ? "translateY(-3px)" : "none",
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 14,
          background: hov ? accent : C.greenLight,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 0.18s",
        }}
      >
        {icon(hov)}
      </div>
      <div>
        <div style={{ fontSize: 19, fontWeight: 700, color: C.text, marginBottom: 8 }}>{title}</div>
        <div style={{ fontSize: 14, color: C.sub, lineHeight: 1.6 }}>{description}</div>
      </div>
      <div
        style={{
          marginTop: "auto",
          fontSize: 13,
          fontWeight: 700,
          color: accent,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        {cta}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
        </svg>
      </div>
    </button>
  );
}