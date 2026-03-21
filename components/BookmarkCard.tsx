"use client";

import { useState, useEffect, useCallback } from "react";
import { Trash2, FolderPlus } from "lucide-react";
import { Bookmark } from "@/types/bookmark";
import { Project } from "@/types/project";
import ProjectDropdown from "./ProjectDropdown";

interface BookmarkCardProps {
  bookmark: Bookmark;
  projects?: Project[];
  onDelete: () => void;
  onUpdateProjectIds?: (projectIds: string[]) => void;
}

export default function BookmarkCard({
  bookmark,
  projects = [],
  onDelete,
  onUpdateProjectIds,
}: BookmarkCardProps) {
  const [showDelete, setShowDelete] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);

  const formattedDate = new Date(bookmark.createdAt).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );

  const firstProjectName = projects.find((p) =>
    bookmark.projectIds?.includes(p.id)
  )?.name;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setShowProjectDropdown(false);
      }}
      onClick={() => window.open(bookmark.url, "_blank", "noopener")}
      style={{
        background: hovered
          ? "var(--color-surface-hover)"
          : "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: 24,
        overflow: "hidden",
        cursor: "pointer",
        transition: "background 0.15s, box-shadow 0.15s",
        boxShadow: hovered ? "0 2px 12px rgba(0,0,0,0.06)" : "none",
        position: "relative",
      }}
    >
      {/* Project assignment button — visible on hover */}
      {hovered && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setShowProjectDropdown(!showProjectDropdown);
          }}
          style={{
            position: "absolute",
            top: 8,
            left: 8,
            maxWidth: "50%",
            zIndex: 2,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              background: "rgba(255,255,255,0.9)",
              border: "1px solid var(--color-border)",
              borderRadius: 999,
              padding: "4px 10px",
              fontSize: "var(--text-caption)",
              color: "var(--color-text-secondary)",
              cursor: "pointer",
              maxWidth: "100%",
            }}
          >
            <FolderPlus size={12} style={{ flexShrink: 0 }} />
            <span
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                minWidth: 0,
              }}
            >
              {firstProjectName || "None"}
            </span>
          </div>
          {showProjectDropdown && (
            <div
              onClick={(e) => e.stopPropagation()}
              style={{ marginTop: 4 }}
            >
              <ProjectDropdown
                projects={projects}
                selectedIds={bookmark.projectIds || []}
                onChange={(ids) => {
                  onUpdateProjectIds?.(ids);
                }}
              />
            </div>
          )}
        </div>
      )}

      {bookmark.thumbnail && (
        <div
          style={{
            width: "100%",
            height: 160,
            overflow: "hidden",
            borderRadius: "16px 16px 0 0",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bookmark.thumbnail}
            alt=""
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        </div>
      )}
      <div style={{ padding: 16 }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
          }}
        >
          {bookmark.favicon && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={bookmark.favicon}
              alt=""
              style={{
                width: 16,
                height: 16,
                borderRadius: 4,
                marginTop: 2,
                flexShrink: 0,
              }}
            />
          )}
          <span
            style={{
              fontSize: "var(--text-body-sm)",
              fontWeight: 600,
              color: "var(--color-text-primary)",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              lineHeight: 1.4,
            }}
          >
            {bookmark.title}
          </span>
        </div>

        {bookmark.description && (
          <p
            style={{
              fontSize: "var(--text-caption)",
              color: "var(--color-text-secondary)",
              marginTop: 8,
              marginBottom: 0,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              lineHeight: 1.5,
            }}
          >
            {bookmark.description}
          </p>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 12,
          }}
        >
          <span
            style={{
              fontSize: "var(--text-caption)",
              color: "var(--color-text-tertiary)",
            }}
          >
            {formattedDate}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDelete(true);
            }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 4,
              display: "flex",
              alignItems: "center",
              color: "var(--color-text-tertiary)",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--color-destructive)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--color-text-tertiary)")
            }
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {showDelete && (
        <DeleteModal
          onDelete={() => {
            onDelete();
            setShowDelete(false);
          }}
          onClose={() => setShowDelete(false)}
        />
      )}
    </div>
  );
}

function DeleteModal({
  onDelete,
  onClose,
}: {
  onDelete: () => void;
  onClose: () => void;
}) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
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
          maxWidth: 360,
          width: "calc(100% - 32px)",
          padding: 24,
        }}
      >
        <h2
          style={{
            fontSize: "var(--text-h3)",
            fontWeight: 700,
            color: "var(--color-text-primary)",
            margin: 0,
          }}
        >
          Delete bookmark?
        </h2>
        <p
          style={{
            fontSize: "var(--text-body-sm)",
            color: "var(--color-text-secondary)",
            marginTop: 8,
            marginBottom: 0,
          }}
        >
          This bookmark will be permanently deleted.
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 12,
            marginTop: 24,
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--color-destructive)",
              fontSize: "var(--text-body-sm)",
              padding: "12px 16px",
              fontFamily: "inherit",
            }}
          >
            Delete
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: 16,
              cursor: "pointer",
              color: "var(--color-text-primary)",
              fontSize: "var(--text-body-sm)",
              padding: "12px 24px",
              fontWeight: 500,
              fontFamily: "inherit",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
