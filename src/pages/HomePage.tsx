import { Link } from "react-router-dom";
import SpotFullWord from "../assets/images/SpotFullWord.png";
import SpotLogo from "../assets/images/SpotLogo.png";
import { RecentPetCard } from "../components/pets/RecentPetCard";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { StatCard } from "../components/ui/StatCard";
import { useRecentPets } from "../hooks/nearby/useRecentPets";
import { Badge } from "../components/ui/Badge";
import { Container } from "../components/ui/Container";
import { Section } from "../components/ui/Section";

export function HomePage() {
  const { pets: recentPets, loading: recentPetsLoading } = useRecentPets();

  return (
    <main style={{ background: "#f9fafb" }}>
      <Section style={{ padding: "72px 0 48px" }}>
        <Container
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.1fr) minmax(320px, 0.9fr)",
            gap: 32,
            alignItems: "center",
          }}
        >
          <div>
            <Badge>Lost & found pet recovery</Badge>

            <img
              src={SpotFullWord}
              alt="Spot"
              style={{
                height: 82,
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
              Browse nearby reports on a map, post a missing or found pet, and
              help neighbors turn sightings into reunions.
            </p>

            <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
              <Link to="/nearby?nearMe=1">
                <Button>View nearby pets</Button>
              </Link>

              <Link to="/nearby?nearMe=1">
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
        </Container>
      </Section>

      <Section style={{ padding: "24px 0" }}>
        <Container
          style={{
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
        </Container>
      </Section>

      <Section style={{ padding: "48px 0" }}>
        <Container>
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
        </Container>
      </Section>

      <Section style={{ padding: "24px 0 72px" }}>
        <Container>
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
              <h2 style={{ fontSize: 34, margin: 0 }}>Recent reports</h2>
              <p style={{ color: "#6b7280", margin: "6px 0 0" }}>
                Latest lost and found pets reported on Spot.
              </p>
            </div>

            <Link to="/nearby?nearMe=1">
              <Button variant="secondary">Open map</Button>
            </Link>
          </div>

          {recentPetsLoading ? (
            <p>Loading recent reports...</p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: 16,
              }}
            >
              {recentPets.map((pet) => (
                <RecentPetCard key={pet.id} pet={pet} />
              ))}
            </div>
          )}
        </Container>
      </Section>
    </main>
  );
}
