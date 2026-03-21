"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Project } from "@/types/project";

interface ProjectModalProps {
  project?: Project;
  onSave: (data: Omit<Project, "id" | "createdAt">) => void;
  onClose: () => void;
}

export default function ProjectModal({
  project,
  onSave,
  onClose,
}: ProjectModalProps) {
  const [name, setName] = useState(project?.name || "");
  const [description, setDescription] = useState(project?.description || "");
  const [error, setError] = useState("");

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function handleSubmit() {
    if (!name.trim()) {
      setError("Project name is required");
      return;
    }
    onSave({
      name: name.trim(),
      description: description.trim(),
    });
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 16px",
    fontSize: "var(--text-body-sm)",
    border: "1px solid var(--color-border)",
    borderRadius: 16,
    outline: "none",
    background: "var(--color-bg)",
    color: "var(--color-text-primary)",
    fontFamily: "inherit",
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "var(--color-overlay)",
        backdropFilter: "blur(4px)",
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="shadow-float"
        style={{
          background: "var(--color-bg)",
          borderRadius: 24,
          maxWidth: 480,
          width: "calc(100% - 32px)",
          padding: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <span
            style={{
              fontSize: "var(--text-h3)",
              fontWeight: 600,
            }}
          >
            {project ? "Edit project" : "New project"}
          </span>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--color-text-tertiary)",
              padding: 4,
              display: "flex",
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Name */}
        <div style={{ marginBottom: 16 }}>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError("");
            }}
            placeholder="e.g. Design inspiration, Research..."
            style={{
              ...inputStyle,
              fontSize: "var(--text-body-lg)",
              borderColor: error ? "var(--color-destructive)" : "var(--color-border)",
            }}
            autoFocus
          />
          {error && (
            <span
              style={{
                fontSize: "var(--text-caption)",
                color: "var(--color-destructive)",
                marginTop: 4,
                display: "block",
              }}
            >
              {error}
            </span>
          )}
        </div>

        {/* Description */}
        <div style={{ marginBottom: 24, position: "relative" }}>
          <textarea
            value={description}
            onChange={(e) => {
              if (e.target.value.length <= 200) setDescription(e.target.value);
            }}
            placeholder="What's this project about?"
            rows={3}
            style={{
              ...inputStyle,
              resize: "none",
            }}
          />
          <span
            style={{
              position: "absolute",
              bottom: 8,
              right: 12,
              fontSize: "var(--text-caption)",
              color: "var(--color-text-tertiary)",
            }}
          >
            {description.length} / 200
          </span>
        </div>

        {/* Buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 12,
          }}
        >
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--color-text-secondary)",
              fontSize: "var(--text-body-sm)",
              padding: "12px 24px",
              fontFamily: "inherit",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: 16,
              cursor: "pointer",
              color: "var(--color-text-primary)",
              fontSize: "var(--text-body-sm)",
              padding: "12px 24px",
              fontWeight: 600,
              fontFamily: "inherit",
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
