import { useTranslation } from "react-i18next";
import { C } from "../utils/consts";

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = i18n.language;
  const langs = ["EN", "PT"];

  return (
    <div
      style={{
        display: "flex",
        borderRadius: 6,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.35)"
      }}
    >
      {langs.map(lang => {
        const active = current === lang.toLowerCase();
        return (
          <button
            key={lang}
            onClick={() => i18n.changeLanguage(lang.toLowerCase())}
            style={{
              padding: "4px 10px",
              fontSize: 12,
              fontWeight: 600,
              border: "none",
              borderLeft: lang !== langs[0] ? "1px solid rgba(255,255,255,0.35)" : "none",
              background: active ? "rgba(255,255,255,0.25)" : "transparent",
              color: C.white,
              cursor: active ? "default" : "pointer",
              letterSpacing: 0.5,
            }}
          >
            {lang}
          </button>
        );
      })}
    </div>
  );
}