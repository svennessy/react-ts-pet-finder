import type { ReactNode } from "react";

type BadgeVariant =
  | "lost"
  | "found"
  | "resolved"
  | "neutral"
  | "verified"
  | "unverified";

type BadgeProps = {
  children: ReactNode;
  variant?: BadgeVariant;
};

const badgeStyles: Record<BadgeVariant, React.CSSProperties> = {
  lost: {
    background: "#fee2e2",
    color: "#991b1b",
  },
  found: {
    background: "#dcfce7",
    color: "#166534",
  },
  resolved: {
    background: "#e0e7ff",
    color: "#3730a3",
  },
  neutral: {
    background: "#f3f4f6",
    color: "#374151",
  },
  verified: {
    background: "#dcfce7",
    color: "#166534",
  },
  unverified: {
    background: "#fef3c7",
    color: "#92400e",
  },
};

export function Badge({ children, variant = "neutral" }: BadgeProps) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        width: "fit-content",
        borderRadius: 999,
        padding: "4px 10px",
        fontSize: 12,
        fontWeight: 800,
        ...badgeStyles[variant],
      }}
    >
      {children}
    </span>
  );
}