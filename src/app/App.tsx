import { Route, Routes } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import { AuthPage } from "../pages/AuthPage";
import { BulletinPage } from "../pages/BulletinPage";
import { FavoritesPage } from "../pages/FavoritesPage";
import { HomePage } from "../pages/HomePage";
import { NearbyPage } from "../pages/NearbyPage";
import { ProfilePage } from "../pages/ProfilePage";
import { NotificationsPage } from "../pages/NotificationsPage";

export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/nearby" element={<NearbyPage />} />
        <Route path="/bulletin" element={<BulletinPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/auth" element={<AuthPage />} />
      </Route>
    </Routes>
  );
}