import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <main style={{ padding: 32 }}>
      <section
        style={{
          display: "grid",
          gap: 20,
          maxWidth: 960,
          margin: "0 auto",
          padding: "64px 0",
        }}
      >
        <p style={{ color: "#2563eb", fontWeight: 800 }}>Spot</p>

        <h1 style={{ fontSize: 56, lineHeight: 1, margin: 0 }}>
          Find lost and found pets near you.
        </h1>

        <p style={{ fontSize: 20, color: "#4b5563", maxWidth: 680 }}>
          Browse nearby reports, post a missing or found pet, and help reunite
          animals with their people.
        </p>

        <div style={{ display: "flex", gap: 12 }}>
          <Link to="/nearby">
            <button type="button">View pets nearby</button>
          </Link>

          <Link to="/bulletin">
            <button type="button">Community bulletin</button>
          </Link>
        </div>
      </section>
    </main>
  );
}