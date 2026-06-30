import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { SkeletonCard } from "../components/SkeletonCard";
import { AppointmentCard } from "../components/AppointmentCard";
import { C } from "../utils/consts";
import { useTranslation } from "react-i18next";
import { useAppointments } from "../hooks/useAppointments";
import { acceptAppointment, rejectAppointment } from "../api/appointments";

const TABS = ["pending", "accepted", "rejected"];

export function NutritionistPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const { data, loading, error, refetch } = useAppointments(id);

  const [items, setItems] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [busyId, setBusyId] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => { setItems(data); }, [data]);

  function showToast(msg, color) {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 2800);
  }

  function applyResult(updated) {
    setItems(list => list.map(a => (a.id === updated.id ? updated : a)));
  }

  async function handleAccept(appointmentId) {
    setBusyId(appointmentId);
    try {
      const updated = await acceptAppointment(appointmentId);
      applyResult(updated);
      showToast(t("NutritionistPage.AppointmentAccepted"), C.green);
    } catch {
      showToast(t("NutritionistPage.ActionFailed"), C.red);
    } finally {
      setBusyId(null);
    }
  }

  async function handleReject(appointmentId) {
    setBusyId(appointmentId);
    try {
      const updated = await rejectAppointment(appointmentId);
      applyResult(updated);
      showToast(t("NutritionistPage.AppointmentRejected"), C.red);
    } catch {
      showToast(t("NutritionistPage.ActionFailed"), C.red);
    } finally {
      setBusyId(null);
    }
  }

  const visible = items.filter(a => a.status === activeTab);

  return (
    <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif", minHeight: "100vh", background: C.bg }}>
      <Navbar />
      <div style={{ maxWidth: 860, margin: "36px auto", padding: "0 20px" }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: C.text, margin: 0, marginBottom: 4 }}>
          {t("NutritionistPage.Title")}
        </h1>
        <p style={{ fontSize: 13, color: C.sub, margin: 0, marginBottom: 20 }}>
          {t("NutritionistPage.Subtitle")}
        </p>

        <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
          {TABS.map(tab => {
            const count = items.filter(a => a.status === tab).length;
            const active = tab === activeTab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: active ? C.green : C.white,
                  color: active ? C.white : C.muted,
                  border: `1px solid ${active ? C.green : C.border}`,
                  borderRadius: 8,
                  padding: "8px 18px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {t(`NutritionistPage.Tabs.${tab.charAt(0).toUpperCase() + tab.slice(1)}`)} ({count})
              </button>
            );
          })}
        </div>

        <div style={{
          background: C.white,
          borderRadius: 12,
          border: `1px solid ${C.border}`,
          padding: "20px",
          boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
        }}>
          {loading && (
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <SkeletonCard /><SkeletonCard /><SkeletonCard />
            </div>
          )}

          {!loading && error && (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{ color: C.red, marginBottom: 12, fontSize: 15 }}>
                {t("NutritionistPage.Error")}
              </div>
              <button
                onClick={refetch}
                style={{
                  background: C.green, color: C.white, border: "none",
                  borderRadius: 6, padding: "9px 24px", fontSize: 13,
                  fontWeight: 600, cursor: "pointer",
                }}
              >
                {t("NutritionistPage.Retry")}
              </button>
            </div>
          )}

          {!loading && !error && visible.length === 0 && (
            <div style={{ textAlign: "center", color: "#bbb", padding: "40px 0", fontSize: 15 }}>
              {t(`NutritionistPage.Empty.${activeTab}`)}
            </div>
          )}

          {!loading && !error && visible.length > 0 && (
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              {visible.map(appt =>
                activeTab === "pending" ? (
                  <AppointmentCard
                    key={appt.id}
                    appointment={appt}
                    busy={busyId === appt.id}
                    onAccept={handleAccept}
                    onReject={handleReject}
                  />
                ) : (
                  <AppointmentCard key={appt.id} appointment={appt} />
                ),
              )}
            </div>
          )}
        </div>
      </div>

      {toast && (
        <div style={{
          position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)",
          background: toast.color, color: C.white, padding: "11px 26px",
          borderRadius: 8, fontSize: 14, fontWeight: 600,
          boxShadow: "0 4px 16px rgba(0,0,0,0.18)", zIndex: 200,
        }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
