import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { StatCard } from "../components/ui/StatCard";
import SpotFullWord from "../assets/images/SpotFullWord.png";
import SpotLogo from "../assets/images/SpotLogo.png";

export function HomePage() {
  return (
    <main style={{ background: "#f9fafb" }}>
      <section
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "72px 24px 48px",
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.1fr) minmax(320px, 0.9fr)",
          gap: 32,
          alignItems: "center",
        }}
      >
        <div>
          <p style={{ color: "#2563eb", fontWeight: 900, marginBottom: 12 }}>
            Spot for lost & found pets
          </p>

          <img
            src={SpotFullWord}
            alt="Spot"
            style={{
              height: 80,
              width: "auto",
              display: "block",
              marginBottom: 24,
            }}
          />
          <h1
            style={{
              fontSize: 60,
              lineHeight: 1,
              letterSpacing: "-0.06em",
              margin: 0,
              color: "#111827",
            }}
          >
            Find lost and found pets near you.
          </h1>

          <p
            style={{
              fontSize: 20,
              lineHeight: 1.6,
              color: "#4b5563",
              maxWidth: 680,
              marginTop: 20,
            }}
          >
            Browse real-time reports on a map, post a lost or found pet, and
            help neighbors turn sightings into reunions.
          </p>

          <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
            <Link to="/nearby?nearMe=1">
              <Button>View nearby pets</Button>
            </Link>

            <Link to="/nearby">
              <Button variant="secondary">Report a pet</Button>
            </Link>
          </div>
        </div>

        <Card style={{ padding: 18 }}>
          <div
            style={{
              height: 360,
              borderRadius: 16,
              background:
                "linear-gradient(135deg, #dbeafe, #eff6ff 45%, #fef3c7)",
              display: "grid",
              placeItems: "center",
              textAlign: "center",
              padding: 24,
            }}
          >
            <div>
              <img
                src={SpotLogo}
                alt="Spot"
                style={{
                  width: 180,
                  height: 180,
                  objectFit: "contain",
                  marginBottom: 16,
                }}
              />

              <h2 style={{ margin: "12px 0 4px" }}>
                Community-powered pet recovery
              </h2>

              <p style={{ margin: 0, color: "#4b5563" }}>
                Lost, found, resolved, and sightings in one place.
              </p>
            </div>
          </div>
        </Card>
      </section>

      <section
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "24px",
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 16,
        }}
      >
        <StatCard
          value="20k+"
          label="Pet reports"
          description="Mock reports across the United States."
        />
        <StatCard
          value="Live"
          label="Map browsing"
          description="Pan, zoom, filter, and search by area."
        />
        <StatCard
          value="Fast"
          label="Sightings"
          description="Neighbors can report where they last saw a pet."
        />
      </section>

      <section
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "48px 24px",
        }}
      >
        <h2 style={{ fontSize: 34, margin: "0 0 18px" }}>How Spot works</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 16,
          }}
        >
          {[
            [
              "1",
              "Report",
              "Post a lost or found pet with photos and location.",
            ],
            [
              "2",
              "Search",
              "Browse nearby pets with filters, cards, and map clusters.",
            ],
            [
              "3",
              "Reunite",
              "Add sightings, update reports, and mark pets resolved.",
            ],
          ].map(([step, title, description]) => (
            <Card key={step} style={{ padding: 24 }}>
              <strong style={{ color: "#2563eb" }}>{step}</strong>
              <h3 style={{ margin: "8px 0" }}>{title}</h3>
              <p style={{ margin: 0, color: "#6b7280" }}>{description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "24px 24px 72px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "end",
            gap: 16,
            marginBottom: 18,
          }}
        >
          <div>
            <h2 style={{ fontSize: 34, margin: 0 }}>Recent activity</h2>
            <p style={{ color: "#6b7280", margin: "6px 0 0" }}>
              A preview of what will become live nearby reports.
            </p>
          </div>

          <Link to="/nearby">
            <Button variant="secondary">Open map</Button>
          </Link>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 16,
          }}
        >
          {[
            ["Lost dog", "Golden retriever seen near downtown."],
            ["Found cat", "Orange tabby reported by a neighbor."],
            ["New sighting", "Possible match added near a park."],
          ].map(([title, description]) => (
            <Card key={title} style={{ padding: 22 }}>
              <h3 style={{ margin: 0 }}>{title}</h3>
              <p style={{ margin: "8px 0 0", color: "#6b7280" }}>
                {description}
              </p>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
