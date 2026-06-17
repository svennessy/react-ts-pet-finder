export function LoadingSpinner() {
    return (
      <span
        aria-label="Loading"
        style={{
          width: 18,
          height: 18,
          borderRadius: "50%",
          border: "3px solid #d1d5db",
          borderTopColor: "#2563eb",
          display: "inline-block",
        }}
      />
    );
  }