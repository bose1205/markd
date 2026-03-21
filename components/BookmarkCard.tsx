"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Bookmark } from "@/types/bookmark";
import DeleteConfirm from "./DeleteConfirm";

interface BookmarkCardProps {
  bookmark: Bookmark;
  onDelete: () => void;
}

export default function BookmarkCard({
  bookmark,
  onDelete,
}: BookmarkCardProps) {
  const [showDelete, setShowDelete] = useState(false);
  const [hovered, setHovered] = useState(false);

  const formattedDate = new Date(bookmark.createdAt).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
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
      }}
    >
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

          {showDelete ? (
            <DeleteConfirm
              onConfirm={() => {
                onDelete();
                setShowDelete(false);
              }}
              onCancel={() => setShowDelete(false)}
            />
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
}
