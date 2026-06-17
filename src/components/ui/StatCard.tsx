import { Card } from "./Card";

type StatCardProps = {
  value: string;
  label: string;
  description?: string;
};

export function StatCard({ value, label, description }: StatCardProps) {
  return (
    <Card style={{ padding: 24 }}>
      <h2 style={{ margin: 0, fontSize: 32 }}>{value}</h2>
      <p style={{ margin: "6px 0 0", fontWeight: 800 }}>{label}</p>
      {description ? (
        <p style={{ margin: "8px 0 0", color: "#6b7280" }}>{description}</p>
      ) : null}
    </Card>
  );
}