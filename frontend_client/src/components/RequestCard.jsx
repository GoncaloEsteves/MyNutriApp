import { Avatar } from "../utils/Avatar";
import { CalendarIcon } from "../utils/CalendarIcon";
import { ClockIcon } from "../utils/ClockIcon";
import { useTranslation } from "react-i18next";

export function RequestCard({ request, onAnswer }) {
  const { t } = useTranslation();

  return (
    <div style={{
      background: "#fff",
      borderRadius: 10,
      border: "1px solid #e8edf0",
      padding: "22px 20px",
      display: "flex",
      flexDirection: "column",
      gap: 0,
      flex: "1 1 220px",
      minWidth: 180,
      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      transition: "box-shadow 0.15s",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        <Avatar name={request.name} size={52} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: "#222", marginBottom: 2 }}>
            {request.name}
          </div>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 12 }}>
            {request.type}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: "#555", marginBottom: 6 }}>
            <CalendarIcon />
            {request.date}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: "#555" }}>
            <ClockIcon />
            {request.time}
          </div>
        </div>
      </div>

      <button
        onClick={() => onAnswer(request)}
        style={{
          marginTop: 18,
          background: "none",
          border: "none",
          color: "#2e9e82",
          fontWeight: 700,
          fontSize: 13,
          cursor: "pointer",
          padding: 0,
          textAlign: "left",
          letterSpacing: 0.1,
        }}
      >
        {t("NutritionistPage.RequestCard.AnswerRequest")}
      </button>
    </div>
  );
}