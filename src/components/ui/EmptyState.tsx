import type { ReactNode } from "react";
import { Card } from "./Card";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Card
      style={{
        padding: 32,
        textAlign: "center",
      }}
    >
      <h2 style={{ margin: 0 }}>{title}</h2>
      {description ? (
        <p style={{ color: "#6b7280", margin: "8px auto 0", maxWidth: 460 }}>
          {description}
        </p>
      ) : null}
      {action ? <div style={{ marginTop: 18 }}>{action}</div> : null}
    </Card>
  );
}