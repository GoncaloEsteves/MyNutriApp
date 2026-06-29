export function TagBadge({ type, label }) {
  const styles = {
    "follow-up": { background: "#e8f5f3", color: "#2e9e82", border: "1px solid #b2dfdb" },
    new: { background: "#fff8e1", color: "#e6a817", border: "1px solid #ffe082" },
  };

  const style = styles[type] || styles["new"];
  
  return (
    <span style={{
      ...style,
      fontSize: 11,
      fontWeight: 600,
      padding: "3px 10px",
      borderRadius: 20,
      letterSpacing: 0.5,
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      textTransform: "uppercase",
    }}>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
      {label}
    </span>
  );
}