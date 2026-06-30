import { Avatar } from "../utils/Avatar";
import { CalendarIcon } from "../utils/CalendarIcon";
import { ClockIcon } from "../utils/ClockIcon";
import { C } from "../utils/consts";
import { useTranslation } from "react-i18next";

const STATUS_COLORS = {
  pending: C.orange,
  accepted: C.green,
  rejected: C.red,
};

function formatDateTime(iso) {
  const d = new Date(iso);
  const date = d.toLocaleDateString();
  const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return { date, time };
}

export function AppointmentCard({ appointment, onAccept, onReject, busy }) {
  const { t } = useTranslation();
  const actionable = Boolean(onAccept && onReject);
  const { date, time } = formatDateTime(appointment.scheduled_date);

  return (
    <div style={{
      background: C.white,
      borderRadius: 10,
      border: `1px solid ${C.border}`,
      padding: "22px 20px",
      display: "flex",
      flexDirection: "column",
      flex: "1 1 220px",
      minWidth: 220,
      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        <Avatar name={appointment.patient_name} size={52} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: C.text, marginBottom: 2 }}>
            {appointment.patient_name}
          </div>
          <div style={{ fontSize: 12, color: C.sub, marginBottom: 12 }}>
            {`${t(appointment.service_type_name)} · ${appointment.location_name}`}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: C.muted, marginBottom: 6 }}>
            <CalendarIcon />{date}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: C.muted }}>
            <ClockIcon />{time}
          </div>
        </div>
        {!actionable && (
          <span style={{
            fontSize: 11,
            fontWeight: 700,
            color: C.white,
            background: STATUS_COLORS[appointment.status],
            borderRadius: 12,
            padding: "3px 10px",
            whiteSpace: "nowrap",
          }}>
            {t(`NutritionistPage.Status.${appointment.status}`)}
          </span>
        )}
      </div>

      {actionable && (
        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <button
            onClick={() => onAccept(appointment.id)}
            disabled={busy}
            style={{
              flex: 1,
              background: C.green,
              color: C.white,
              border: "none",
              borderRadius: 7,
              padding: "9px 0",
              fontSize: 13,
              fontWeight: 600,
              cursor: busy ? "not-allowed" : "pointer",
              opacity: busy ? 0.5 : 1,
            }}
          >
            {t("NutritionistPage.Accept")}
          </button>
          <button
            onClick={() => onReject(appointment.id)}
            disabled={busy}
            style={{
              flex: 1,
              background: C.white,
              color: C.red,
              border: `1px solid ${C.red}`,
              borderRadius: 7,
              padding: "9px 0",
              fontSize: 13,
              fontWeight: 600,
              cursor: busy ? "not-allowed" : "pointer",
              opacity: busy ? 0.5 : 1,
            }}
          >
            {t("NutritionistPage.Reject")}
          </button>
        </div>
      )}
    </div>
  );
}
