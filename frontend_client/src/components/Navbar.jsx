import { C } from "../utils/consts";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Navbar({ onHome }) {
  const { t } = useTranslation();

  return (
    <nav
      style={{
        background: C.green,
        padding: "0 32px",
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}
    >
      <button
        onClick={onHome}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 10,
          color: C.white,
          fontWeight: 700,
          fontSize: 20,
          padding: 0 }}
      >
        {t("AppName")}
      </button>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ color: C.white, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
          {t("Navbar.KnowOurSoftware")}
        </div>
        <LanguageSwitcher />
      </div>
    </nav>
  );
}