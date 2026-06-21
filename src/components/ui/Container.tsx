import type { HTMLAttributes, ReactNode } from "react";

type ContainerProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  size?: "default" | "wide" | "narrow";
};

const maxWidths = {
  default: 1120,
  wide: 1280,
  narrow: 760,
};

export function Container({
  children,
  size = "default",
  style,
  ...props
}: ContainerProps) {
  return (
    <div
      {...props}
      style={{
        maxWidth: maxWidths[size],
        margin: "0 auto",
        padding: "0 24px",
        ...style,
      }}
    >
      {children}
    </div>
  );
}