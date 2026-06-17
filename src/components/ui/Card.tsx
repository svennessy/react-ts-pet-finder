import type { HTMLAttributes, ReactNode } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function Card({ children, style, ...props }: CardProps) {
  return (
    <div
      {...props}
      style={{
        background: "white",
        border: "1px solid #e5e7eb",
        borderRadius: 18,
        boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}