import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
  fullWidth?: boolean;
};

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background: "#2563eb",
    color: "white",
    border: "1px solid #2563eb",
  },
  secondary: {
    background: "white",
    color: "#111827",
    border: "1px solid #d1d5db",
  },
  danger: {
    background: "#dc2626",
    color: "white",
    border: "1px solid #dc2626",
  },
  ghost: {
    background: "transparent",
    color: "#374151",
    border: "1px solid transparent",
  },
};

export function Button({
  children,
  variant = "primary",
  fullWidth = false,
  style,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled}
      style={{
        borderRadius: 999,
        padding: "10px 16px",
        fontWeight: 800,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.65 : 1,
        width: fullWidth ? "100%" : undefined,
        ...variantStyles[variant],
        ...style,
      }}
    >
      {children}
    </button>
  );
}