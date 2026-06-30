import { Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { PatientPage } from './pages/PatientPage';
import { NutritionistPage } from './pages/NutritionistPage';
import { NutritionistDetailPage } from './pages/NutritionistDetailPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/patient" element={<PatientPage />} />
      <Route path="/dashboard/:id" element={<NutritionistPage />} />
      <Route path="/nutritionists/:id" element={<NutritionistDetailPage />} />
    </Routes>
  );
}
