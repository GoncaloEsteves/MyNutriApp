import { useState } from "react";
import { useTranslation } from "react-i18next";
import { requestAppointment } from "../api/appointments";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function nowLocalDatetime() {
  const d = new Date();
  const pad = n => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const overlayStyle = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)",
  display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
};
const cardStyle = {
  background: "#fff", borderRadius: 12, padding: "32px 36px",
  width: 420, maxWidth: "90vw", boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
};
const labelStyle = { fontSize: 13, fontWeight: 600, color: "#444", marginBottom: 4, display: "block" };
const fieldStyle = {
  width: "100%", padding: "9px 12px", borderRadius: 6,
  border: "1px solid #d4dadf", fontSize: 14, outline: "none", boxSizing: "border-box",
};
const hintStyle = { color: "#e05a5a", fontSize: 12, marginTop: 4 };
const primaryBtnStyle = {
  flex: 1, background: "#2e9e82", color: "#fff", border: "none",
  borderRadius: 7, padding: "10px 0", fontSize: 14, fontWeight: 600, cursor: "pointer",
};
const secondaryBtnStyle = {
  flex: 1, background: "#fff", color: "#666", border: "1px solid #ccc",
  borderRadius: 7, padding: "10px 0", fontSize: 14, fontWeight: 600, cursor: "pointer",
};

export function AppointmentRequestModal({ nutritionist, onClose }) {
  const { t } = useTranslation();
  const [serviceId, setServiceId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [phase, setPhase] = useState("form"); // "form" | "submitting" | "success"
  const [submitError, setSubmitError] = useState(null);

  if (!nutritionist) return null;

  const tk = k => t(`PatientPage.AppointmentRequestModal.${k}`);

  const emailValid = EMAIL_RE.test(email);
  const dateFuture = scheduledAt !== "" && new Date(scheduledAt).getTime() > Date.now();
  const isValid = serviceId !== "" && name.trim() !== "" && emailValid && dateFuture;
  const busy = phase === "submitting";

  async function handleSubmit(e) {
    e.preventDefault();
    if (!isValid || busy) return;
    setPhase("submitting");
    setSubmitError(null);
    try {
      await requestAppointment(nutritionist.id, serviceId, {
        patient_name: name.trim(),
        patient_email: email.trim(),
        scheduled_date: new Date(scheduledAt).toISOString(),
      });
      setPhase("success");
    } catch {
      setPhase("form");
      setSubmitError(tk("Errors.SubmitFailed"));
    }
  }

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={cardStyle} onClick={e => e.stopPropagation()}>
        {phase === "success" ? (
          <div>
            <div style={{ fontWeight: 700, fontSize: 18, color: "#2e9e82", marginBottom: 10 }}>
              {tk("SuccessTitle")}
            </div>
            <div style={{ fontSize: 14, color: "#555", marginBottom: 24 }}>
              {tk("SuccessMessage")}
            </div>
            <button type="button" onClick={onClose} style={{ ...primaryBtnStyle, width: "100%" }}>
              {tk("Close")}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ fontWeight: 700, fontSize: 18, color: "#222", marginBottom: 20 }}>
              {t("PatientPage.AppointmentRequestModal.Title", { name: nutritionist.name })}
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle} htmlFor="ar-service">{tk("ServiceLabel")}</label>
              <select id="ar-service" value={serviceId}
                onChange={e => setServiceId(e.target.value)} style={fieldStyle}>
                <option value="">{tk("ServicePlaceholder")}</option>
                {nutritionist.services.map(s => (
                  <option key={s.id} value={s.id}>
                    {t("PatientPage.AppointmentRequestModal.ServiceOption", {
                      type: t(s.service_type_name),
                      location: s.location_name,
                      price: s.price,
                      duration: s.duration,
                    })}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle} htmlFor="ar-name">{tk("NameLabel")}</label>
              <input id="ar-name" type="text" value={name}
                onChange={e => setName(e.target.value)}
                placeholder={tk("NamePlaceholder")} style={fieldStyle} />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle} htmlFor="ar-email">{tk("EmailLabel")}</label>
              <input id="ar-email" type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={tk("EmailPlaceholder")} style={fieldStyle} />
              {email !== "" && !emailValid && (
                <div style={hintStyle}>{tk("Errors.InvalidEmail")}</div>
              )}
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle} htmlFor="ar-date">{tk("DateLabel")}</label>
              <input id="ar-date" type="datetime-local" value={scheduledAt}
                min={nowLocalDatetime()}
                onChange={e => setScheduledAt(e.target.value)} style={fieldStyle} />
              {scheduledAt !== "" && !dateFuture && (
                <div style={hintStyle}>{tk("Errors.PastDate")}</div>
              )}
            </div>

            {submitError && (
              <div style={{ ...hintStyle, marginTop: 0, marginBottom: 14 }}>{submitError}</div>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button type="submit" disabled={!isValid || busy}
                style={{ ...primaryBtnStyle,
                  opacity: (!isValid || busy) ? 0.5 : 1,
                  cursor: (!isValid || busy) ? "not-allowed" : "pointer" }}>
                {busy ? tk("Sending") : tk("Submit")}
              </button>
              <button type="button" onClick={onClose} style={secondaryBtnStyle}>
                {tk("Cancel")}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
