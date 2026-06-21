import { Link, NavLink, useNavigate } from "react-router-dom";
import SpotFullWord from "../../assets/images/SpotFullWord.png";
import { useAuthSession } from "../../hooks/auth/useAuthSession";
import { useNotifications } from "../../hooks/shared/useNotifications";

function navLinkStyle({ isActive }: { isActive: boolean }) {
  return {
    color: isActive ? "#2563eb" : "#374151",
    textDecoration: "none",
    fontWeight: isActive ? 800 : 600,
  };
}

export function Header() {
  const auth = useAuthSession();
  const notifications = useNotifications();
  const navigate = useNavigate();

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
          position: "relative",
        }}
      >
        <Link
          to="/nearby?nearMe=1"
          style={{
            display: "flex",
            alignItems: "center",
            padding: "8px 52px 8px 14px",
            border: "1px solid #d1d5db",
            borderRadius: 999,
            background: "white",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            color: "#6b7280",
            fontSize: 14,
            textDecoration: "none",
            height: 42,
            boxSizing: "border-box",
          }}
        >
          Search city, ZIP, breed, or pet name
        </Link>

        <button
          type="button"
          title="Center map on my location"
          onClick={() => navigate(`/nearby?nearMe=1&center=${Date.now()}`)}
          style={{
            position: "absolute",
            right: 6,
            top: "50%",
            transform: "translateY(-50%)",
            width: 30,
            height: 30,
            borderRadius: 999,
            display: "grid",
            placeItems: "center",
            color: "#374151",
            background: "#f9fafb",
            border: "1px solid #e5e7eb",
            cursor: "pointer",
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v3" />
            <path d="M12 19v3" />
            <path d="M2 12h3" />
            <path d="M19 12h3" />
          </svg>
        </button>
      </div>

      <nav style={{ display: "flex", gap: 18, alignItems: "center" }}>
        <NavLink to="/nearby?nearMe=1" style={navLinkStyle}>
          Nearby
        </NavLink>

        <NavLink to="/bulletin" style={navLinkStyle}>
          Bulletin
        </NavLink>

        <NavLink to="/favorites" style={navLinkStyle}>
          Saved
        </NavLink>

        {auth.isAuthenticated ? (
          <NavLink
            to="/notifications"
            style={{
              ...navLinkStyle({ isActive: false }),
              position: "relative",
            }}
          >
            Notifications
            {notifications.unreadCount > 0 ? (
              <span
                style={{
                  position: "absolute",
                  top: -8,
                  right: -12,
                  minWidth: 18,
                  height: 18,
                  borderRadius: 999,
                  background: "#ef4444",
                  color: "white",
                  fontSize: 11,
                  fontWeight: 700,
                  display: "grid",
                  placeItems: "center",
                  padding: "0 4px",
                }}
              >
                {notifications.unreadCount}
              </span>
            ) : null}
          </NavLink>
        ) : null}
      </nav>
    </header>
  );
}
