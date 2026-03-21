"use client";

import { useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Plus } from "lucide-react";
import { User } from "firebase/auth";
import { useAuth } from "@/hooks/useAuth";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useProjects } from "@/hooks/useProjects";
import { useClipboard } from "@/hooks/useClipboard";
import { useToastContext } from "@/app/ToastProvider";
import { addBookmark, addProject } from "@/lib/bookmarks";
import { Project } from "@/types/project";
import CreateMenu from "./CreateMenu";
import BookmarkModal from "./BookmarkModal";
import ProjectModal from "./ProjectModal";

interface BottomNavProps {
  user: User | null;
  /** @deprecated No longer used — BottomNav manages its own state */
  isMenuOpen?: boolean;
  /** @deprecated No longer used — BottomNav manages its own state */
  onToggleMenu?: () => void;
  /** @deprecated No longer used — BottomNav manages its own state */
  onAddBookmark?: () => void;
  /** @deprecated No longer used — BottomNav manages its own state */
  onAddProject?: () => void;
  /** @deprecated No longer used — BottomNav manages its own state */
  onAddClick?: () => void;
}

export default function BottomNav({ user }: BottomNavProps) {
  const pathname = usePathname();
  const { user: authUser } = useAuth();
  const { bookmarks } = useBookmarks(authUser?.uid);
  const { projects } = useProjects(authUser?.uid);
  const { showToast } = useToastContext();

  const [menuOpen, setMenuOpen] = useState(false);
  const [bookmarkModalOpen, setBookmarkModalOpen] = useState(false);
  const [bookmarkModalUrl, setBookmarkModalUrl] = useState<string | undefined>();
  const [projectModalOpen, setProjectModalOpen] = useState(false);

  const handleUrlDetected = useCallback(
    (url: string) => {
      if (bookmarkModalOpen || projectModalOpen) return;
      setBookmarkModalUrl(url);
      setBookmarkModalOpen(true);
    },
    [bookmarkModalOpen, projectModalOpen]
  );

  useClipboard(handleUrlDetected);

  async function handleSaveBookmark(data: {
    url: string;
    title: string;
    description: string;
    thumbnail: string;
    favicon: string;
    projectIds: string[];
  }) {
    if (!authUser) return;
    try {
      await addBookmark(authUser.uid, data);
      showToast("Saved to Markd");
      setBookmarkModalOpen(false);
    } catch {
      showToast("Something went wrong", "error");
    }
  }

  async function handleSaveProject(
    data: Omit<Project, "id" | "createdAt">
  ) {
    if (!authUser) return;
    try {
      await addProject(authUser.uid, data);
      showToast("Project created");
      setProjectModalOpen(false);
    } catch {
      showToast("Something went wrong", "error");
    }
  }

  return (
    <>
      <nav
        className="shadow-float"
        style={{
          position: "fixed",
          bottom: 24,
          left: "50%",
          transform: "translateX(-50%)",
          background: "var(--color-nav-bg)",
          backdropFilter: "blur(12px)",
          borderRadius: 999,
          border: "1px solid var(--color-border)",
          padding: "12px 24px",
          display: "flex",
          alignItems: "center",
          gap: 24,
          zIndex: 40,
        }}
      >
        <Link
          href="/home"
          style={{
            display: "flex",
            alignItems: "center",
            color:
              pathname === "/home"
                ? "var(--color-text-primary)"
                : "var(--color-text-tertiary)",
            transition: "color 0.15s",
          }}
        >
          <Home size={24} />
        </Link>

        <div style={{ position: "relative" }}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              display: "flex",
              alignItems: "center",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--color-text-primary)",
              padding: 0,
            }}
          >
            <Plus size={28} />
          </button>

          <CreateMenu
            open={menuOpen}
            onClose={() => setMenuOpen(false)}
            onBookmark={() => {
              setBookmarkModalUrl(undefined);
              setBookmarkModalOpen(true);
            }}
            onProject={() => setProjectModalOpen(true)}
          />
        </div>

        <Link
          href="/profile"
          style={{
            display: "flex",
            alignItems: "center",
            textDecoration: "none",
          }}
        >
          {user?.photoURL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.photoURL}
              alt=""
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                objectFit: "cover",
                border:
                  pathname === "/profile"
                    ? "2px solid var(--color-text-primary)"
                    : "2px solid transparent",
              }}
            />
          ) : (
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "var(--color-surface)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "var(--text-body-sm)",
                fontWeight: 600,
                color:
                  pathname === "/profile"
                    ? "var(--color-text-primary)"
                    : "var(--color-text-tertiary)",
                border:
                  pathname === "/profile"
                    ? "2px solid var(--color-text-primary)"
                    : "2px solid transparent",
              }}
            >
              {user?.displayName?.[0]?.toUpperCase() || "?"}
            </div>
          )}
        </Link>
      </nav>

      {bookmarkModalOpen && (
        <BookmarkModal
          initialUrl={bookmarkModalUrl}
          existingBookmarks={bookmarks}
          projects={projects}
          onSave={handleSaveBookmark}
          onClose={() => {
            setBookmarkModalOpen(false);
            setBookmarkModalUrl(undefined);
          }}
        />
      )}

      {projectModalOpen && (
        <ProjectModal
          onSave={handleSaveProject}
          onClose={() => setProjectModalOpen(false)}
        />
      )}
    </>
  );
}
