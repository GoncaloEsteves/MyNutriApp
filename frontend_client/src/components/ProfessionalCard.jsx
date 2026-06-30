import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar } from "../utils/Avatar";
import { TagBadge } from "../utils/TagBadge";
import { CalendarIcon } from "../utils/CalendarIcon";
import { LocationIcon } from "../utils/LocationIcon";
import { useTranslation } from "react-i18next";
import { AppointmentRequestModal } from "./AppointmentRequestModal";

export function ProfessionalCard({ pro }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [scheduling, setScheduling] = useState(false);

  const servicesLocations = [... new Set(pro.services.map(s => s.location_name))].join(", ")

  const serviceTypesSet = [... new Set(pro.services.map(s => s.service_type_name))]
  let serviceTypes = t(serviceTypesSet.sort()[0])

  if (serviceTypesSet.length > 1)
    serviceTypes = t("PatientPage.ProfessionalCard.MoreAppointmentOptions", { value: serviceTypes, count: pro.services.length - 1 })

  const min = pro.services.reduce((acc, s) => {
    if (s.price < acc)
      return s.price
    else
      return acc
  }, Number.MAX_SAFE_INTEGER)
  
  const priceRange = t("PatientPage.ProfessionalCard.PriceRange", { min })

  return (
    <div style={{
      background: "#fff",
      borderRadius: 10,
      border: "1px solid #e8edf0",
      padding: "22px 28px",
      marginBottom: 16,
      display: "flex",
      alignItems: "flex-start",
      gap: 20,
      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    }}>
      <Avatar name={pro.name} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ marginBottom: 6 }}>
          <TagBadge type={"follow-up"} label={"Follow-up"} />
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, color: "#2e9e82", marginBottom: 2 }}>
          {pro.name}
        </div>
        <div style={{ fontSize: 13, color: "#888", marginBottom: 14 }}>
          #{pro.id}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 0" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <LocationIcon />
              <span style={{ fontSize: 13, color: "#2e9e82", fontWeight: 600 }}>{servicesLocations}</span>
            </div>
          </div>

          <div style={{ paddingLeft: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <CalendarIcon />
              <span style={{ fontSize: 13, color: "#555" }}>{serviceTypes}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 13, color: "#555" }}>{priceRange}</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 160 }}>
        <button style={{
          background: "#f0a080",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          padding: "9px 18px",
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
          onClick={() => setScheduling(true)}
          onMouseOver={e => e.target.style.background = "#e08a65"}
          onMouseOut={e => e.target.style.background = "#f0a080"}
        >
          {t("PatientPage.ProfessionalCard.ScheduleAppointment")}
        </button>
        <button
          onClick={() => navigate(`/nutritionists/${pro.id}`)}
          style={{
            background: "#e8f5f3",
            color: "#2e9e82",
            border: "1px solid #b2dfdb",
            borderRadius: 6,
            padding: "9px 18px",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
          onMouseOver={e => { e.target.style.background = "#d0eeea"; }}
          onMouseOut={e => { e.target.style.background = "#e8f5f3"; }}
        >
          {t("PatientPage.ProfessionalCard.ViewProfile")}
        </button>
      </div>
      {scheduling && (
        <AppointmentRequestModal
          nutritionist={pro}
          onClose={() => setScheduling(false)}
        />
      )}
    </div>
  );
}