import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { SkeletonCard } from "../components/SkeletonCard";
import { C } from "../utils/consts";
import { useTranslation } from "react-i18next";
import { useNutritionist } from "../hooks/useNutritionist";

export function NutritionistDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data, loading, error, refetch } = useNutritionist(id);

  return (
    <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif", minHeight: "100vh", background: C.bg }}>
      <Navbar />
      <div style={{ maxWidth: 760, margin: "28px auto", padding: "0 16px" }}>
        <button
          onClick={() => navigate('/patient')}
          style={{
            background: "none",
            border: "none",
            color: C.green,
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 600,
            padding: 0,
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <span aria-hidden="true">←</span>
          <span>{t("NutritionistDetailPage.Back")}</span>
        </button>

        {loading && <SkeletonCard />}

        {!loading && error && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ color: C.red, marginBottom: 12, fontSize: 15 }}>
              {t("NutritionistDetailPage.Error")}
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
              {t("NutritionistDetailPage.Retry")}
            </button>
          </div>
        )}

        {!loading && !error && data && (
          <div style={{
            background: C.white,
            borderRadius: 10,
            border: `1px solid ${C.border}`,
            padding: "28px 32px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: C.green, marginBottom: 4 }}>
              {data.name}
            </div>
            <div style={{ fontSize: 13, color: C.sub }}>
              #{data.id}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
