import { useState } from "react";
import { Navbar } from "../components/Navbar";
import { IconButton } from "../components/IconButton";
import { RequestCard } from "../components/RequestCard";
import { SkeletonCard } from "../components/SkeletonCard";
import { RequestModal } from "../components/RequestModal";
import { C } from "../utils/consts";
import { useTranslation } from "react-i18next";

const initialRequests = [
  {
    id: 1,
    name: "Francisco Neves",
    type: "Online appointment",
    date: "21st December 2025",
    time: "9:30 am",
  },
  {
    id: 2,
    name: "Ana Costa",
    type: "In-person appointment",
    date: "22nd December 2025",
    time: "11:00 am",
  },
  {
    id: 3,
    name: "Miguel Santos",
    type: "Online appointment",
    date: "23rd December 2025",
    time: "2:15 pm",
  },
];

export function NutritionistPage({ onHome }) {
  const { t } = useTranslation();

  const [requests, setRequests] = useState(initialRequests);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);

  function showToast(msg, color) {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 2800);
  }

  function handleAccept(id) {
    setRequests(r => r.filter(x => x.id !== id));
    setModal(null);
    showToast(t("NutritionistPage.AppointmentAccepted"), C.green);
  }

  function handleReject(id) {
    setRequests(r => r.filter(x => x.id !== id));
    setModal(null);
    showToast(t("NutritionistPage.AppointmentRejected"), C.red);
  }

  return (
    <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif", minHeight: "100vh", background: C.bg }}>
      <Navbar onHome={onHome} />
      <div style={{ maxWidth: 860, margin: "36px auto", padding: "0 20px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: C.text, margin: 0, marginBottom: 4 }}>
              {t("NutritionistPage.PendingRequests.Title")}
            </h1>
            <p style={{ fontSize: 13, color: C.sub, margin: 0 }}>
              {t("NutritionistPage.PendingRequests.Description")}
            </p>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <IconButton title="Previous">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </IconButton>
            <IconButton title="Next">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </IconButton>
            <IconButton title="Share">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </IconButton>
            <IconButton title="History">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-3.51" />
              </svg>
            </IconButton>
          </div>
        </div>
        <div
          style={{
            background: C.white,
            borderRadius: 12,
            border: `1px solid ${C.border}`,
            padding: "20px",
            boxShadow: "0 1px 6px rgba(0,0,0,0.05)"
            }}
        >
          {requests.length === 0
            ?
            <div style={{ textAlign: "center", color: "#bbb", padding: "40px 0", fontSize: 15 }}>
              {t("NutritionistPage.PendingRequests.Title")}
            </div>
            :
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              {requests.map(req => <RequestCard key={req.id} request={req} onAnswer={setModal} />)}
              {requests.length < 3 && Array.from({ length: 3 - requests.length }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          }
        </div>
      </div>
      <RequestModal
        request={modal}
        onAccept={handleAccept}
        onReject={handleReject}
        onClose={() => setModal(null)}
      />
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 28,
            left: "50%",
            transform: "translateX(-50%)",
            background: toast.color,
            color: C.white,
            padding: "11px 26px",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
            zIndex: 200,
            animation: "fadeIn 0.2s ease"
          }}
        >
          {toast.msg}
        </div>
      )}
      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateX(-50%) translateY(8px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }`}</style>
    </div>
  );
}
