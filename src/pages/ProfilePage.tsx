import { Link } from "react-router-dom";
import { useAuthSession } from "../hooks/auth/useAuthSession";
import { useProfileDashboard } from "../hooks/auth/useProfileDashboard";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Container } from "../components/ui/Container";
import { Section } from "../components/ui/Section";
import { formatRelativeTime } from "../utils/nearby/formatRelativeTime";

export function ProfilePage() {
  const auth = useAuthSession();
  const { dashboard, loading } = useProfileDashboard();

  if (!auth.loading && !auth.isAuthenticated) {
    return (
      <main>
        <Section>
          <Container size="narrow">
            <Card style={{ padding: 32, textAlign: "center" }}>
              <h1>Sign in to view your profile</h1>
              <p style={{ color: "#6b7280" }}>
                Your reports, saved pets, and verification status will appear
                here.
              </p>

              <Link to="/auth">
                <Button>Sign in</Button>
              </Link>
            </Card>
          </Container>
        </Section>
      </main>
    );
  }

  const profile = dashboard?.profile;

  return (
    <main>
      <Section>
        <Container>
          <h1>Profile</h1>

          {loading ? (
            <p>Loading profile...</p>
          ) : (
            <>
              <Card style={{ padding: 24 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 16,
                  }}
                >
                  <div>
                    <h2 style={{ margin: 0 }}>
                      {profile?.firstName || profile?.lastName
                        ? `${profile?.firstName ?? ""} ${profile?.lastName ?? ""}`.trim()
                        : "Spot user"}
                    </h2>
                    <p style={{ color: "#6b7280", margin: "6px 0 0" }}>
                      {profile?.email}
                    </p>
                  </div>

                  <Badge variant={profile?.isVerified ? "found" : "neutral"}>
                    {profile?.isVerified ? "Verified" : "Not verified"}
                  </Badge>
                </div>
              </Card>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gap: 16,
                  marginTop: 16,
                }}
              >
                <Card style={{ padding: 20 }}>
                  <strong>Reports</strong>
                  <h2>{dashboard?.stats.reportsCount ?? 0}</h2>
                </Card>

                <Card style={{ padding: 20 }}>
                  <strong>Saved Pets</strong>
                  <h2>{dashboard?.stats.favoritesCount ?? 0}</h2>
                  <Link to="/favorites">View saved pets</Link>
                </Card>

                <Card style={{ padding: 20 }}>
                  <strong>Sightings</strong>
                  <h2>{dashboard?.stats.sightingsCount ?? 0}</h2>
                  <Link to="/bulletin">View bulletin</Link>
                </Card>
              </div>

              <Card style={{ padding: 24, marginTop: 16 }}>
                <h2 style={{ marginTop: 0 }}>Recent Reports</h2>

                {dashboard?.recentReports.length ? (
                  dashboard.recentReports.map((report) => (
                    <Link
                      key={report.id}
                      to={`/nearby?pet=${report.id}&lat=${report.latitude}&lng=${report.longitude}&zoom=14`}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        color: "inherit",
                        textDecoration: "none",
                        padding: "12px 0",
                        borderTop: "1px solid #e5e7eb",
                      }}
                    >
                      <span>{report.name}</span>
                      <span style={{ color: "#6b7280" }}>
                        {report.reportStatus} ·{" "}
                        {formatRelativeTime(report.createdAt)}
                      </span>
                    </Link>
                  ))
                ) : (
                  <p style={{ color: "#6b7280" }}>
                    You have not posted any pet reports yet.
                  </p>
                )}
              </Card>
            </>
          )}
        </Container>
      </Section>
    </main>
  );
}
