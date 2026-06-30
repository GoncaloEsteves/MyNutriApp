import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Avatar } from "../utils/Avatar";
import { SkeletonCard } from "./SkeletonCard";
import { C } from "../utils/consts";
import { useNutritionists } from "../hooks/useNutritionists";

export function NutritionistPickerModal({ onClose }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useNutritionists({ searchBy: "", location: "" });

  function pick(id) {
    navigate(`/dashboard/${id}`);
    onClose();
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: C.white,
          borderRadius: 12,
          padding: "28px 32px",
          width: 420,
          maxWidth: "90vw",
          maxHeight: "80vh",
          overflowY: "auto",
          boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 18, color: C.text, marginBottom: 18 }}>
          {t("NutritionistPage.Picker.Title")}
        </div>

        {loading && (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        )}

        {!loading && error && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ color: C.red, marginBottom: 12, fontSize: 14 }}>
              {t("NutritionistPage.Picker.Error")}
            </div>
            <button
              onClick={refetch}
              style={{
                background: C.green, color: C.white, border: "none",
                borderRadius: 6, padding: "8px 22px", fontSize: 13,
                fontWeight: 600, cursor: "pointer",
              }}
            >
              {t("NutritionistPage.Picker.Retry")}
            </button>
          </div>
        )}

        {!loading && !error && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {data.map(n => (
              <button
                key={n.id}
                onClick={() => pick(n.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  background: C.white, border: `1px solid ${C.border}`,
                  borderRadius: 8, padding: "10px 14px", cursor: "pointer",
                  textAlign: "left", width: "100%",
                }}
                onMouseOver={e => { e.currentTarget.style.background = C.greenLight; }}
                onMouseOut={e => { e.currentTarget.style.background = C.white; }}
              >
                <Avatar name={n.name} size={40} />
                <span style={{ fontWeight: 600, fontSize: 15, color: C.text }}>{n.name}</span>
              </button>
            ))}
          </div>
        )}

        <button
          onClick={onClose}
          style={{
            marginTop: 18, width: "100%", background: C.white, color: C.muted,
            border: `1px solid ${C.border}`, borderRadius: 7, padding: "9px 0",
            fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}
        >
          {t("NutritionistPage.Picker.Close")}
        </button>
      </div>
    </div>
  );
}
