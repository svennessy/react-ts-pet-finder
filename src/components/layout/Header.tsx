import { Link, NavLink } from "react-router-dom";
import SpotFullWord from "../../assets/images/SpotFullWord.png";

function navLinkStyle({ isActive }: { isActive: boolean }) {
  return {
    color: isActive ? "#2563eb" : "#374151",
    textDecoration: "none",
    fontWeight: isActive ? 800 : 600,
  };
}

export function Header() {
  return (
    <header
      style={{
        height: 64,
        display: "grid",
        gridTemplateColumns: "180px minmax(0, 1fr) auto",
        alignItems: "center",
        gap: 18,
        padding: "0 24px",
        borderBottom: "1px solid #e5e7eb",
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(10px)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <Link
        to="/"
        style={{
          display: "flex",
          alignItems: "center",
        }}
      >
        <img
          src={SpotFullWord}
          alt="Spot"
          style={{
            height: 40,
            width: "auto",
            display: "block",
          }}
        />
      </Link>

      <div
        style={{
          maxWidth: 560,
          width: "100%",
          justifySelf: "center",
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 14px",
          border: "1px solid #d1d5db",
          borderRadius: 999,
          background: "white",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          color: "#6b7280",
          fontSize: 14,
        }}
      >
        <span>Search city, ZIP, breed, or pet name</span>
      </div>

      <nav style={{ display: "flex", gap: 18, alignItems: "center" }}>
        <NavLink to="/nearby?nearMe=1" style={navLinkStyle}>
          Nearby
        </NavLink>

        <NavLink to="/bulletin" style={navLinkStyle}>
          Bulletin
        </NavLink>

        <NavLink to="/auth" style={navLinkStyle}>
          Sign in
        </NavLink>
      </nav>
    </header>
  );
}
