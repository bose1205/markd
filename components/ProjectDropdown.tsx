"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { Project } from "@/types/project";

interface ProjectDropdownProps {
  projects: Project[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export default function ProjectDropdown({
  projects,
  selectedIds,
  onChange,
}: ProjectDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [open]);

  const selectedNames = projects
    .filter((p) => selectedIds.includes(p.id))
    .map((p) => p.name)
    .join(", ");

  function toggleProject(id: string) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((sid) => sid !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  }

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: 999,
          padding: "6px 12px",
          fontSize: "var(--text-body-sm)",
          color: "var(--color-text-secondary)",
          cursor: "pointer",
          fontFamily: "inherit",
          maxWidth: "100%",
        }}
      >
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {selectedNames || "No project"}
        </span>
        <ChevronDown size={12} style={{ flexShrink: 0 }} />
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            zIndex: 50,
            minWidth: 200,
            maxHeight: 200,
            overflowY: "auto",
            background: "var(--color-bg)",
            borderRadius: 16,
            border: "1px solid var(--color-border)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
            padding: 8,
          }}
        >
          {projects.length === 0 ? (
            <div
              style={{
                padding: 16,
                textAlign: "center",
                fontSize: "var(--text-caption)",
                color: "var(--color-text-secondary)",
              }}
            >
              You can create Projects to organise your bookmarks better
            </div>
          ) : (
            projects.map((project) => {
              const selected = selectedIds.includes(project.id);
              return (
                <button
                  key={project.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleProject(project.id);
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      "var(--color-surface-hover)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    fontSize: "var(--text-body-sm)",
                    color: "var(--color-text-primary)",
                    fontFamily: "inherit",
                    textAlign: "left",
                  }}
                >
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: 4,
                      border: selected
                        ? "none"
                        : "1px solid var(--color-border)",
                      background: selected
                        ? "var(--color-text-primary)"
                        : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {selected && (
                      <Check size={12} style={{ color: "var(--color-bg)" }} />
                    )}
                  </div>
                  {project.name}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
