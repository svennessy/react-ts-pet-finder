type PostPetButtonProps = {
    onClick: () => void;
  };
  
  export function PostPetButton({ onClick }: PostPetButtonProps) {
    return (
      <button
        type="button"
        onClick={onClick}
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          zIndex: 20,
          border: 0,
          borderRadius: 999,
          padding: "10px 16px",
          background: "#2563eb",
          color: "white",
          fontWeight: 700,
          cursor: "pointer",
          boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
        }}
      >
        Post a pet
      </button>
    );
  }