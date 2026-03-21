"use client";

import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Bookmark } from "@/types/bookmark";
import { Project } from "@/types/project";
import ProjectDropdown from "./ProjectDropdown";

interface BookmarkModalProps {
  initialUrl?: string;
  bookmark?: Bookmark;
  existingBookmarks?: Bookmark[];
  projects?: Project[];
  onSave: (data: {
    url: string;
    title: string;
    description: string;
    thumbnail: string;
    favicon: string;
    projectIds: string[];
  }) => void;
  onClose: () => void;
}

function normalizeUrl(u: string): string {
  return u.trim().toLowerCase().replace(/\/+$/, "");
}

export default function BookmarkModal({
  initialUrl,
  bookmark,
  existingBookmarks = [],
  projects = [],
  onSave,
  onClose,
}: BookmarkModalProps) {
  const [url, setUrl] = useState(bookmark?.url || initialUrl || "");
  const [title, setTitle] = useState(bookmark?.title || "");
  const [description, setDescription] = useState(
    bookmark?.description || ""
  );
  const [thumbnail, setThumbnail] = useState(bookmark?.thumbnail || "");
  const [favicon, setFavicon] = useState(bookmark?.favicon || "");
  const [projectIds, setProjectIds] = useState<string[]>(
    bookmark?.projectIds || []
  );
  const [fetching, setFetching] = useState(false);
  const [errors, setErrors] = useState<{ url?: string; title?: string }>({});
  const urlInputRef = useRef<HTMLInputElement>(null);
  const hasFetchedRef = useRef(false);

  function isValidUrl(str: string): boolean {
    try {
      const u = new URL(str);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  }

  async function fetchMeta(targetUrl: string) {
    if (!isValidUrl(targetUrl) || fetching) return;
    setFetching(true);
    try {
      const res = await fetch(
        `/api/meta?url=${encodeURIComponent(targetUrl)}`
      );
      const data = await res.json();
      if (data.title && !title) setTitle(data.title);
      if (data.thumbnail) setThumbnail(data.thumbnail);
      if (data.favicon) setFavicon(data.favicon);
    } catch {
      // ignore
    } finally {
      setFetching(false);
    }
  }

  useEffect(() => {
    if (initialUrl && !hasFetchedRef.current && !bookmark) {
      hasFetchedRef.current = true;
      fetchMeta(initialUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialUrl]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    urlInputRef.current?.focus();
  }, []);

  function handleSubmit() {
    const newErrors: { url?: string; title?: string } = {};
    if (!url.trim()) {
      newErrors.url = "URL is required";
    } else if (!isValidUrl(url.trim())) {
      newErrors.url = "Please enter a valid URL";
    } else if (
      !bookmark &&
      existingBookmarks.some(
        (b) => normalizeUrl(b.url) === normalizeUrl(url)
      )
    ) {
      newErrors.url = "You've already saved this link";
    }
    if (!title.trim()) {
      newErrors.title = "Title is required";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSave({
      url: url.trim(),
      title: title.trim(),
      description: description.trim(),
      thumbnail,
      favicon,
      projectIds,
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
            marginBottom: 20,
          }}
        >
          <span
            style={{
              fontSize: "var(--text-h3)",
              fontWeight: 600,
            }}
          >
            {bookmark ? "Edit bookmark" : "Save bookmark"}
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

        {/* URL */}
        <div style={{ marginBottom: 16 }}>
          <input
            ref={urlInputRef}
            type="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setErrors((prev) => ({ ...prev, url: undefined }));
            }}
            onBlur={() => {
              if (url && isValidUrl(url) && !bookmark) fetchMeta(url);
            }}
            onPaste={(e) => {
              const pasted = e.clipboardData.getData("text/plain").trim();
              if (pasted) {
                setUrl(pasted);
                setErrors((prev) => ({ ...prev, url: undefined }));
              }
              setTimeout(() => {
                if (isValidUrl(pasted) && !bookmark) fetchMeta(pasted);
              }, 0);
            }}
            placeholder="https://..."
            style={{
              ...inputStyle,
              borderColor: errors.url
                ? "var(--color-destructive)"
                : "var(--color-border)",
            }}
          />
          {errors.url && (
            <span
              style={{
                fontSize: "var(--text-caption)",
                color: "var(--color-destructive)",
                marginTop: 4,
                display: "block",
              }}
            >
              {errors.url}
            </span>
          )}
          {fetching && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 8,
              }}
            >
              <div className="spinner-sm" />
              <span
                style={{
                  fontSize: "var(--text-caption)",
                  color: "var(--color-text-tertiary)",
                }}
              >
                Fetching metadata...
              </span>
            </div>
          )}
        </div>

        {/* Thumbnail preview */}
        {thumbnail && (
          <div
            style={{
              marginBottom: 16,
              borderRadius: 16,
              overflow: "hidden",
              height: 120,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumbnail}
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

        {/* Title */}
        <div style={{ marginBottom: 16 }}>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setErrors((prev) => ({ ...prev, title: undefined }));
            }}
            placeholder="Title"
            style={{
              ...inputStyle,
              borderColor: errors.title
                ? "var(--color-destructive)"
                : "var(--color-border)",
            }}
          />
          {errors.title && (
            <span
              style={{
                fontSize: "var(--text-caption)",
                color: "var(--color-destructive)",
                marginTop: 4,
                display: "block",
              }}
            >
              {errors.title}
            </span>
          )}
        </div>

        {/* Description */}
        <div style={{ marginBottom: 16, position: "relative" }}>
          <textarea
            value={description}
            onChange={(e) => {
              if (e.target.value.length <= 300)
                setDescription(e.target.value);
            }}
            placeholder="Why did you save this? What's useful about it?"
            rows={4}
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
            {description.length} / 300
          </span>
        </div>

        {/* Add to project */}
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              fontSize: "var(--text-body-sm)",
              color: "var(--color-text-secondary)",
              marginBottom: 8,
            }}
          >
            Add to project
          </div>
          <ProjectDropdown
            projects={projects}
            selectedIds={projectIds}
            onChange={setProjectIds}
          />
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
