"use client";

import { Search, X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        padding: "16px 16px 0",
      }}
    >
      <div
        className="shadow-float"
        style={{
          maxWidth: 640,
          margin: "0 auto",
          background: "var(--color-nav-bg)",
          backdropFilter: "blur(12px)",
          borderRadius: 999,
          border: "1px solid var(--color-border)",
          height: 48,
          padding: "0 16px",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Search
          size={16}
          style={{ color: "var(--color-text-tertiary)", flexShrink: 0 }}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search bookmarks..."
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            background: "transparent",
            fontSize: "var(--text-body-sm)",
            color: "var(--color-text-primary)",
            fontFamily: "inherit",
          }}
        />
        {value && (
          <button
            onClick={() => onChange("")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--color-text-tertiary)",
              padding: 4,
              display: "flex",
              alignItems: "center",
            }}
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
