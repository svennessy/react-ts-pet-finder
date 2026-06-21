import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useAuthSession } from "../../hooks/auth/useAuthSession";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Container } from "../ui/Container";
import { Section } from "../ui/Section";

type RequireAuthProps = {
  children: ReactNode;
  title?: string;
  description?: string;
};

export function RequireAuth({
  children,
  title = "Sign in required",
  description = "Sign in to continue.",
}: RequireAuthProps) {
  const auth = useAuthSession();

  if (auth.loading) {
    return (
      <Section>
        <Container size="narrow">
          <Card style={{ padding: 32, textAlign: "center" }}>
            <p>Checking your session...</p>
          </Card>
        </Container>
      </Section>
    );
  }

  if (!auth.isAuthenticated) {
    return (
      <Section>
        <Container size="narrow">
          <Card style={{ padding: 32, textAlign: "center" }}>
            <h1>{title}</h1>
            <p style={{ color: "#6b7280" }}>{description}</p>

            <Link to="/auth">
              <Button>Sign in</Button>
            </Link>
          </Card>
        </Container>
      </Section>
    );
  }

  return <>{children}</>;
}