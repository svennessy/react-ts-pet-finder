import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchRecentSightings } from "../api/sightings";
import type { BulletinSighting } from "../types/sightings";
import { formatRelativeTime } from "../utils/nearby/formatRelativeTime";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { Container } from "../components/ui/Container";
import { EmptyState } from "../components/ui/EmptyState";
import { Section } from "../components/ui/Section";

export function BulletinPage() {
  const [sightings, setSightings] = useState<BulletinSighting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadSightings(signal?: AbortSignal) {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchRecentSightings(signal);
      setSightings(result.sightings);
    } catch (err) {
      if (signal?.aborted) return;
      setError("Could not load bulletin updates.");
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    const controller = new AbortController();

    void loadSightings(controller.signal);

    return () => controller.abort();
  }, []);

  return (
    <main>
      <Section>
        <Container>
          <h1>Community Bulletin</h1>
          <p style={{ color: "#6b7280" }}>
            Recent pet sightings reported by the Spot community.
          </p>

          {loading ? (
            <p>Loading bulletin...</p>
          ) : error ? (
            <Card style={{ padding: 24 }}>
              <p>{error}</p>
              <button type="button" onClick={() => void loadSightings()}>
                Try again
              </button>
            </Card>
          ) : sightings.length === 0 ? (
            <EmptyState
              title="No sightings yet"
              description="When neighbors report sightings, they will appear here."
            />
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: 16,
                marginTop: 24,
              }}
            >
              {sightings.map((sighting) => (
                <Link
                  key={sighting.id}
                  to={`/nearby?pet=${sighting.petId}&lat=${sighting.latitude}&lng=${sighting.longitude}&zoom=14`}
                  style={{
                    color: "inherit",
                    textDecoration: "none",
                  }}
                >
                  <Card style={{ padding: 18 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        alignItems: "center",
                      }}
                    >
                      <Badge variant={sighting.pet.reportStatus}>
                        {sighting.pet.reportStatus}
                      </Badge>

                      <span style={{ color: "#6b7280", fontSize: 13 }}>
                        {formatRelativeTime(sighting.createdAt)}
                      </span>
                    </div>

                    <h3 style={{ margin: "12px 0 4px" }}>
                      Sighting for {sighting.pet.name}
                    </h3>

                    <p style={{ margin: 0, color: "#6b7280" }}>
                      {sighting.locationLabel ??
                        `${sighting.latitude.toFixed(4)}, ${sighting.longitude.toFixed(4)}`}
                    </p>

                    {sighting.notes ? <p>{sighting.notes}</p> : null}

                    <p style={{ marginBottom: 0, color: "#6b7280" }}>
                      {sighting.pet.breedLabel}
                    </p>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </Container>
      </Section>
    </main>
  );
}
