import { Avatar } from "../utils/Avatar";
import { CalendarIcon } from "../utils/CalendarIcon";
import { ClockIcon } from "../utils/ClockIcon";
import { useTranslation } from "react-i18next";

export function RequestModal({ request, onAccept, onReject, onClose }) {
  const { t } = useTranslation()

  if (!request) return null;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.35)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 100,
    }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: "32px 36px",
          minWidth: 340,
          boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <Avatar name={request.name} size={52} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 17, color: "#222" }}>{request.name}</div>
            <div style={{ fontSize: 13, color: "#888", marginTop: 2 }}>{request.type}</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#555" }}>
            <CalendarIcon />{request.date}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#555" }}>
            <ClockIcon />{request.time}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => onAccept(request.id)}
            style={{
              flex: 1,
              background: "#2e9e82",
              color: "#fff",
              border: "none",
              borderRadius: 7,
              padding: "10px 0",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {t("NutritionistPage.RequestModal.Accept")}
          </button>
          <button
            onClick={() => onReject(request.id)}
            style={{
              flex: 1,
              background: "#fff",
              color: "#e05a5a",
              border: "1px solid #e05a5a",
              borderRadius: 7,
              padding: "10px 0",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {t("NutritionistPage.RequestModal.Reject")}
          </button>
        </div>
      </div>
    </div>
  );
}