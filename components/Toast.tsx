"use client";

import { ToastItem } from "@/hooks/useToast";

interface ToastProps {
  toasts: ToastItem[];
}

export default function Toast({ toasts }: ToastProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 16,
        right: 16,
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="toast-enter shadow-float"
          style={{
            background: "var(--color-bg)",
            borderRadius: 16,
            border: "1px solid var(--color-border)",
            padding: "12px 16px",
            fontSize: "var(--text-body-sm)",
            borderLeft:
              toast.type === "error"
                ? "3px solid var(--color-destructive)"
                : "3px solid var(--color-text-primary)",
            color: "var(--color-text-primary)",
          }}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
