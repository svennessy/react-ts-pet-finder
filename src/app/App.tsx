import { Navigate, Route, Routes } from "react-router-dom";
import { AuthPage } from "../features/auth/AuthPage";
import { NearbyPage } from "../features/nearby/NearbyPage";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/nearby" replace />} />
      <Route path="/nearby" element={<NearbyPage />} />
      <Route path="/auth" element={<AuthPage />} />
    </Routes>
  );
}