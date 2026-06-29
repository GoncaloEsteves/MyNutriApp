export function SkeletonCard() {
  return (
    <div
      data-testid="skeleton-card"
      style={{
        background: "#fff",
        borderRadius: 10,
        border: "1px solid #e8edf0",
        padding: "22px 20px",
        display: "flex",
        alignItems: "flex-start",
        gap: 16,
        flex: "1 1 220px",
        minWidth: 180,
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: "50%",
          background: "#e8edf0",
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, paddingTop: 4 }}>
        <div style={{ height: 12, background: "#e8edf0", borderRadius: 6, width: "70%" }} />
        <div style={{ height: 10, background: "#f0f3f4", borderRadius: 6, width: "50%" }} />
        <div style={{ height: 10, background: "#f0f3f4", borderRadius: 6, width: "60%", marginTop: 4 }} />
        <div style={{ height: 10, background: "#f0f3f4", borderRadius: 6, width: "40%" }} />
      </div>
    </div>
  );
}