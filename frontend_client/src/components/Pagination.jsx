export function Pagination({ current, total, onChange }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 8 }}>
      <button
        onClick={() => onChange(Math.max(1, current - 1))}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: current === 1 ? "#ccc" : "#555",
          fontSize: 16,
          padding: "4px 8px",
        }}
        disabled={current === 1}
      >
        ‹
      </button>
      {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          onClick={() => onChange(n)}
          style={{
            width: 30,
            height: 30,
            borderRadius: 4,
            border: "none",
            background: n === current ? "#2e9e82" : "none",
            color: n === current ? "#fff" : "#555",
            fontWeight: n === current ? 700 : 400,
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          {n}
        </button>
      ))}
      <button
        onClick={() => onChange(Math.min(total, current + 1))}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: current === total ? "#ccc" : "#555",
          fontSize: 16,
          padding: "4px 8px",
        }}
        disabled={current === total}
      >
        ›
      </button>
    </div>
  );
}