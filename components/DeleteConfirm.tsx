"use client";

interface DeleteConfirmProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirm({
  onConfirm,
  onCancel,
}: DeleteConfirmProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontSize: "var(--text-caption)",
      }}
    >
      <span style={{ color: "var(--color-destructive)" }}>Delete?</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onConfirm();
        }}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--color-destructive)",
          fontSize: "var(--text-caption)",
          fontWeight: 600,
          padding: "4px 8px",
          borderRadius: 8,
        }}
      >
        Yes
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onCancel();
        }}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--color-text-secondary)",
          fontSize: "var(--text-caption)",
          padding: "4px 8px",
          borderRadius: 8,
        }}
      >
        No
      </button>
    </div>
  );
}
