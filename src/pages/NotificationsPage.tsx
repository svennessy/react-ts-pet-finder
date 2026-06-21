import { Link } from "react-router-dom";
import { useNotifications } from "../hooks/shared/useNotifications";
import { formatRelativeTime } from "../utils/nearby/formatRelativeTime";
import { Card } from "../components/ui/Card";
import { Container } from "../components/ui/Container";
import { EmptyState } from "../components/ui/EmptyState";
import { Section } from "../components/ui/Section";

export function NotificationsPage() {
  const { notifications, loading, markRead } = useNotifications();

  return (
    <main>
      <Section>
        <Container size="narrow">
          <h1>Notifications</h1>

          {loading ? (
            <p>Loading notifications...</p>
          ) : notifications.length === 0 ? (
            <EmptyState
              title="No notifications yet"
              description="Sightings and important pet updates will appear here."
            />
          ) : (
            <div style={{ display: "grid", gap: 12, marginTop: 24 }}>
              {notifications.map((notification) => {
                const href = notification.pet
                  ? `/nearby?pet=${notification.pet.id}&lat=${notification.pet.latitude}&lng=${notification.pet.longitude}&zoom=14`
                  : "/nearby";

                return (
                  <Link
                    key={notification.id}
                    to={href}
                    onClick={() => void markRead(notification.id)}
                    style={{ color: "inherit", textDecoration: "none" }}
                  >
                    <Card
                      style={{
                        padding: 18,
                        border: notification.readAt
                          ? "1px solid #e5e7eb"
                          : "2px solid #f97316",
                      }}
                    >
                      <strong>{notification.message}</strong>
                      <p style={{ color: "#6b7280", marginBottom: 0 }}>
                        {formatRelativeTime(notification.createdAt)}
                      </p>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </Container>
      </Section>
    </main>
  );
}