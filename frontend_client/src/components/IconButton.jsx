import { useState } from "react";

export function IconButton({ children, title }) {
  const [hovered, setHovered] = useState(false);
  
  return (
    <button
      title={title}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 32, height: 32,
        border: "1px solid #e0e4e7",
        borderRadius: 6,
        background: hovered ? "#f0f3f4" : "#fff",
        cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#666",
        transition: "background 0.15s",
      }}
    >
      {children}
    </button>
  );
}