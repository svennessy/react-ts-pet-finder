import { Navigate, Route, Routes } from "react-router-dom";
import { NearbyPage } from "../features/nearby/NearbyPage";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/nearby" replace />} />
      <Route path="/nearby" element={<NearbyPage />} />
    </Routes>
  );
}