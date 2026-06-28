export function Avatar({ name }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  return (
    <div style={{
      width: 68,
      height: 68,
      borderRadius: "50%",
      background: "#b2dfdb",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 22,
      fontWeight: 700,
      color: "#2e7d6e",
      flexShrink: 0,
      border: "2px solid #e0f2f1",
    }}>
      {initials}
    </div>
  );
}