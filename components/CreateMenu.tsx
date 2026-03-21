"use client";

import { useEffect, useRef } from "react";
import { Bookmark, FolderPlus } from "lucide-react";

interface CreateMenuProps {
  open: boolean;
  onClose: () => void;
  onBookmark: () => void;
  onProject: () => void;
}

export default function CreateMenu({
  open,
  onClose,
  onBookmark,
  onProject,
}: CreateMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    // Delay listener so the opening click doesn't immediately close
    const timer = setTimeout(() => {
      document.addEventListener("click", handleClick);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("click", handleClick);
    };
  }, [open, onClose]);

  if (!open) return null;

  const rowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: "12px 16px",
    borderRadius: 16,
    cursor: "pointer",
    transition: "background 0.15s",
    border: "none",
    background: "none",
    width: "100%",
    textAlign: "left",
    fontFamily: "inherit",
  };

  const iconBoxStyle: React.CSSProperties = {
    width: 44,
    height: 44,
    borderRadius: 12,
    background: "var(--color-surface)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  };

  return (
    <div
      ref={menuRef}
      className="create-menu-enter"
      style={{
        position: "absolute",
        bottom: 64,
        left: "50%",
        transform: "translateX(-50%)",
        width: 280,
        background: "var(--color-bg)",
        borderRadius: 24,
        border: "1px solid var(--color-border)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
        padding: 8,
        zIndex: 51,
      }}
    >
      <button
        onClick={() => {
          onBookmark();
          onClose();
        }}
        style={rowStyle}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = "var(--color-surface-hover)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.background = "transparent")
        }
      >
        <div style={iconBoxStyle}>
          <Bookmark size={24} style={{ color: "var(--color-text-primary)" }} />
        </div>
        <div>
          <div
            style={{
              fontSize: "var(--text-body-lg)",
              fontWeight: 600,
              color: "var(--color-text-primary)",
            }}
          >
            Bookmark
          </div>
          <div
            style={{
              fontSize: "var(--text-caption)",
              color: "var(--color-text-secondary)",
              marginTop: 2,
            }}
          >
            Add links of your favourite materials
          </div>
        </div>
      </button>

      <button
        onClick={() => {
          onProject();
          onClose();
        }}
        style={rowStyle}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = "var(--color-surface-hover)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.background = "transparent")
        }
      >
        <div style={iconBoxStyle}>
          <FolderPlus
            size={24}
            style={{ color: "var(--color-text-primary)" }}
          />
        </div>
        <div>
          <div
            style={{
              fontSize: "var(--text-body-lg)",
              fontWeight: 600,
              color: "var(--color-text-primary)",
            }}
          >
            Project
          </div>
          <div
            style={{
              fontSize: "var(--text-caption)",
              color: "var(--color-text-secondary)",
              marginTop: 2,
            }}
          >
            Organize your bookmarks inside projects
          </div>
        </div>
      </button>
    </div>
  );
}
