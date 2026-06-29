import { useState } from "react";
import { Navbar } from "../components/Navbar";
import { HomeCard } from "../components/HomeCard";
import { C } from "../utils/consts";
import { useTranslation } from "react-i18next";

export function HomePage({ onPatient, onNutritionist }) {
  const { t } = useTranslation()

  return (
    <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif", minHeight: "100vh", background: C.bg }}>
      <Navbar onHome={() => {}} />

      <div style={{ background: C.green, padding: "48px 32px 56px", textAlign: "center" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            background: "rgba(255,255,255,0.12)",
            borderRadius: 30,
            padding: "6px 18px",
            marginBottom: 20
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span style={{ fontSize: 12, color: "#fff", fontWeight: 600, letterSpacing: 0.5 }}>TRUSTED NUTRITION PLATFORM</span>
        </div>
        <h1
          style={{
            fontSize: 36,
            fontWeight: 800,
            color: C.white,
            margin: "0 0 12px",
            letterSpacing: -0.5,
            lineHeight: 1.2
          }}
        >
          {t("HomePage.Welcome")}<span style={{ fontStyle: "italic" }}>{t("AppName")}</span>
        </h1>
        <p
          style={{
            fontSize: 16,
            color: "rgba(255,255,255,0.82)",
            maxWidth: 480,
            margin: "0 auto",
            lineHeight: 1.6
          }}
        >
          {t("HomePage.Description")}
        </p>
      </div>

      <svg
        viewBox="0 0 1440 40"
        preserveAspectRatio="none"
        style={{ display: "block", width: "100%", height: 40, marginBottom: -1 }}
      >
        <path d="M0,0 C360,40 1080,0 1440,40 L1440,0 Z" fill={C.green} />
      </svg>

      <div
        style={{
          maxWidth: 800,
          margin: "0 auto",
          padding: "48px 24px 64px",
          display: "flex",
          gap: 24,
          justifyContent: "center",
          flexWrap: "wrap"
          }}
        >
        <HomeCard
          title={t("HomePage.HomeCard.PatientTitle")}
          description={t("HomePage.HomeCard.PatientDescription")}
          cta={t("HomePage.HomeCard.PatientCta")}
          accent={C.green}
          onClick={onPatient}
          icon={(hov) => (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
              stroke={hov ? C.white : C.green} strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          )}
        />

        <HomeCard
          title={t("HomePage.HomeCard.NutritionistTitle")}
          description={t("HomePage.HomeCard.NutritionistDescription")}
          cta={t("HomePage.HomeCard.NutritionistCta")}
          accent={C.orange}
          onClick={onNutritionist}
          icon={(hov) => (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
              stroke={hov ? C.white : C.orange} strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          )}
        />
      </div>
      <p style={{ textAlign: "center", fontSize: 12, color: "#aaa", paddingBottom: 32 }}>
        © {new Date().getFullYear()} {t("AppName")} · {t("HomePage.FooterNote")}
      </p>
    </div>
  );
}