import { useState } from "react";
import { ProfessionalCard } from "../components/ProfessionalCard";
import { Pagination } from "../components/Pagination";
import { Navbar } from "../components/Navbar";
import { C } from "../utils/consts";
import { useTranslation } from "react-i18next";

const professionals = [
  {
    id: 1,
    name: "Mary Jane",
    services: [
      {
        id: 1,
        price: 25.0,
        duration: 45,
        service_type_name: "SERVICETYPE.ONLINEAPPOINTMENT",
        location_name: "Leiria",
      },
      {
        id: 2,
        price: 40.0,
        duration: 60,
        service_type_name: "SERVICETYPE.CLINICAPPOINTMENT",
        location_name: "Coimbra",
      },
    ],
  },
  {
    id: 2,
    name: "Carlos Mendes",
    services: [
      {
        id: 3,
        price: 40.0,
        duration: 60,
        service_type_name: "SERVICETYPE.HOMEAPPOINTMENT",
        location_name: "Lisboa",
      },
    ],
  },
  {
    id: 3,
    name: "Sofia Reis",
    services: [
      {
        id: 4,
        price: 30.0,
        duration: 45,
        service_type_name: "SERVICETYPE.CLINICAPPOINTMENT",
        location_name: "Porto",
      },
    ],
  },
];

export function PatientPage({ onHome }) {
  const { t } = useTranslation()

  const [search, setSearch]   = useState("");
  const [location, setLocation] = useState("");
  const [page, setPage]       = useState(1);

  const filtered = professionals.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.services.some(s =>
      s.service_type_name.toLowerCase().includes(search.toLowerCase()) ||
      s.location_name.toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif", minHeight: "100vh", background: C.bg }}>
      <Navbar onHome={onHome} />
      <div style={{ background: C.green, padding: "20px 32px 28px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", gap: 10 }}>
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder={t("PatientPage.Search.Placeholder")}
            style={{
              flex: 2,
              padding: "11px 16px",
              borderRadius: 6,
              border: "none",
              fontSize: 14,
              outline: "none",
              color: "#333",
              background: C.white
            }}
          />
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              background: C.white,
              borderRadius: 6,
              padding: "0 12px",
              gap: 8
            }}
          >
            <input
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder={t("PatientPage.Search.LocationPlaceholder")}
              style={{ flex: 1, border: "none", fontSize: 14, outline: "none", color: "#333" }}
            />
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <button
            style={{
              background: C.orange,
              color: C.white,
              border: "none",
              borderRadius: 6,
              padding: "11px 28px",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            {t("PatientPage.Search.Button")}
          </button>
        </div>
      </div>
      <div style={{ maxWidth: 760, margin: "28px auto", padding: "0 16px" }}>
        {filtered.length === 0
          ?
            <div style={{ textAlign: "center", color: "#aaa", padding: "60px 0", fontSize: 16 }}>
              {t("PatientPage.NoProfessionalsFound")}
            </div>
          : filtered.map(pro => <ProfessionalCard key={pro.id} pro={pro} />)
        }
        <Pagination current={page} total={6} onChange={setPage} />
      </div>
    </div>
  );
}
