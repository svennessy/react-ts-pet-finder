import type { HTMLAttributes, ReactNode } from "react";

type SectionProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
};

export function Section({ children, style, ...props }: SectionProps) {
  return (
    <section
      {...props}
      style={{
        padding: "48px 0",
        ...style,
      }}
    >
      {children}
    </section>
  );
}