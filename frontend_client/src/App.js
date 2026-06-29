import { useState } from "react";
import { HomePage } from "./pages/HomePage";
import { PatientPage } from "./pages/PatientPage";
import { NutritionistPage } from "./pages/NutritionistPage";

// ─── APP ROUTER ───────────────────────────────────────────────────────────────

export default function App() {
  const [page, setPage] = useState("home");

  if (page === "patient")
    return <PatientPage onHome={() => setPage("home")} />;

  if (page === "nutritionist")
    return <NutritionistPage onHome={() => setPage("home")} />;

  return (
    <HomePage
      onPatient={() => setPage("patient")}
      onNutritionist={() => setPage("nutritionist")}
    />
  );
}
