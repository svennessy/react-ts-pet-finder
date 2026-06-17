import { Route, Routes } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import { BulletinPage } from "../pages/BulletinPage";
import { HomePage } from "../pages/HomePage";
import { NearbyPage } from "../pages/NearbyPage";
import { AuthPage } from "../pages/AuthPage";

export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/nearby" element={<NearbyPage />} />
        <Route path="/bulletin" element={<BulletinPage />} />
        <Route path="/auth" element={<AuthPage />} />
      </Route>
    </Routes>
  );
}