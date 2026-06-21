import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";

const AuthPage = lazy(() =>
  import("../pages/AuthPage").then((module) => ({ default: module.AuthPage })),
);

const BulletinPage = lazy(() =>
  import("../pages/BulletinPage").then((module) => ({
    default: module.BulletinPage,
  })),
);

const FavoritesPage = lazy(() =>
  import("../pages/FavoritesPage").then((module) => ({
    default: module.FavoritesPage,
  })),
);

const HomePage = lazy(() =>
  import("../pages/HomePage").then((module) => ({ default: module.HomePage })),
);

const NearbyPage = lazy(() =>
  import("../pages/NearbyPage").then((module) => ({
    default: module.NearbyPage,
  })),
);

const NotificationsPage = lazy(() =>
  import("../pages/NotificationsPage").then((module) => ({
    default: module.NotificationsPage,
  })),
);

const ProfilePage = lazy(() =>
  import("../pages/ProfilePage").then((module) => ({
    default: module.ProfilePage,
  })),
);

function PageLoading() {
  return (
    <div style={{ padding: 24 }}>
      <p>Loading...</p>
    </div>
  );
}

export function App() {
  return (
    <Suspense fallback={<PageLoading />}>
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
    </Suspense>
  );
}