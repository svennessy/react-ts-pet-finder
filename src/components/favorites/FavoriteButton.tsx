type FavoriteButtonProps = {
  isFavorite: boolean;
  loading?: boolean;
  onClick: () => void | Promise<void>;
};

export function FavoriteButton({
  isFavorite,
  loading = false,
  onClick,
}: FavoriteButtonProps) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
      
        if (loading) return;
      
        void onClick();
      }}
      aria-label={isFavorite ? "Remove from saved pets" : "Save pet"}
      title={isFavorite ? "Remove from saved pets" : "Save pet"}
      style={{
        border: 0,
        borderRadius: 999,
        width: 38,
        height: 38,
        display: "grid",
        placeItems: "center",
        background: "rgba(255,255,255,0.95)",
        boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
        cursor: loading ? "wait" : "pointer",
        fontSize: 20,
        color: isFavorite ? "#dc2626" : "#374151",
        opacity: loading ? 0.75 : 1,
      }}
    >
      {isFavorite ? "♥" : "♡"}
    </button>
  );
}