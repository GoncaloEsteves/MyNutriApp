import { useState, useEffect } from "react";
import { ProfessionalCard } from "../components/ProfessionalCard";
import { SkeletonCard } from "../components/SkeletonCard";
import { Navbar } from "../components/Navbar";
import { C } from "../utils/consts";
import { useTranslation } from "react-i18next";
import { useNutritionists } from "../hooks/useNutritionists";
import { getServiceTypes } from "../api/serviceTypes";

export function PatientPage() {
  const { t } = useTranslation();
  const [searchInput, setSearchInput] = useState("");
  const [serviceTypeSelect, setServiceTypeSelect] = useState(undefined);
  const [locationInput, setLocationInput] = useState("");
  const [query, setQuery] = useState({ searchBy: "", location: "", serviceType: undefined });
  const [serviceTypes, setServiceTypes] = useState([]);

  useEffect(() => {
    const controller = new AbortController();
    getServiceTypes(controller.signal).then(setServiceTypes).catch(() => {});
    return () => controller.abort();
  }, []);

  const { data, loading, error, refetch } = useNutritionists(query);

  function commitSearch() {
    setQuery({ searchBy: searchInput, location: locationInput, serviceType: serviceTypeSelect });
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") commitSearch();
  }

  return (
    <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif", minHeight: "100vh", background: C.bg }}>
      <Navbar />
      <div style={{ background: C.green, padding: "20px 32px 28px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", gap: 10 }}>
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("PatientPage.Search.Placeholder")}
            style={{
              flex: 2,
              padding: "11px 16px",
              borderRadius: 6,
              border: "none",
              fontSize: 14,
              outline: "none",
              color: "#333",
              background: C.white,
            }}
          />
          <select
            value={serviceTypeSelect}
            onChange={e => setServiceTypeSelect(Number(e.target.value))}
            style={{
              flex: 1,
              padding: "11px 16px",
              borderRadius: 6,
              border: "none",
              fontSize: 14,
              outline: "none",
              color: serviceTypeSelect ? "#333" : "#aaa",
              background: C.white,
              cursor: "pointer",
            }}
          >
            <option value="">{t("PatientPage.Search.ServiceTypePlaceholder")}</option>
            {serviceTypes.map(st => (
              <option key={st.id} value={st.id}>{t(st.name)}</option>
            ))}
          </select>
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              background: C.white,
              borderRadius: 6,
              padding: "0 12px",
              gap: 8,
            }}
          >
            <input
              value={locationInput}
              onChange={e => setLocationInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("PatientPage.Search.LocationPlaceholder")}
              style={{ flex: 1, border: "none", fontSize: 14, outline: "none", color: "#333" }}
            />
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <button
            onClick={commitSearch}
            style={{
              background: C.orange,
              color: C.white,
              border: "none",
              borderRadius: 6,
              padding: "11px 28px",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {t("PatientPage.Search.Button")}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: "28px auto", padding: "0 16px" }}>
        {loading && (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        )}
        {!loading && error && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ color: C.red, marginBottom: 12, fontSize: 15 }}>
              {t("PatientPage.Error")}
            </div>
            <button
              onClick={refetch}
              style={{
                background: C.green,
                color: C.white,
                border: "none",
                borderRadius: 6,
                padding: "9px 24px",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {t("PatientPage.Retry")}
            </button>
          </div>
        )}
        {!loading && !error && data.length === 0 && (
          <div style={{ textAlign: "center", color: "#aaa", padding: "60px 0", fontSize: 16 }}>
            {t("PatientPage.NoProfessionalsFound")}
          </div>
        )}
        {!loading && !error && data.map(pro => (
          <ProfessionalCard key={pro.id} pro={pro} />
        ))}
      </div>
    </div>
  );
}
