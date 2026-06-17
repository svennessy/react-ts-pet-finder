import { Outlet } from "react-router-dom";
import { Header } from "./Header";

export function AppLayout() {
  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
      <Header />
      <Outlet />
    </div>
  );
}
