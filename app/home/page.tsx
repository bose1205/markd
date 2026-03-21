"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Bookmark as BookmarkIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useProjects } from "@/hooks/useProjects";
import { useClipboard } from "@/hooks/useClipboard";
import { useToastContext } from "@/app/ToastProvider";
import {
  addBookmark,
  deleteBookmark,
  updateBookmark,
  addProject,
} from "@/lib/bookmarks";
import { Bookmark } from "@/types/bookmark";
import { Project } from "@/types/project";
import SearchBar from "@/components/SearchBar";
import MasonryGrid from "@/components/MasonryGrid";
import BookmarkCard from "@/components/BookmarkCard";
import BookmarkModal from "@/components/BookmarkModal";
import ProjectModal from "@/components/ProjectModal";
import BottomNav from "@/components/BottomNav";
import LoadingSkeleton from "@/components/LoadingSkeleton";

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const { bookmarks, loading: bookmarksLoading } = useBookmarks(user?.uid);
  const { projects } = useProjects(user?.uid);
  const { showToast } = useToastContext();
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalUrl, setModalUrl] = useState<string | undefined>();
  const [editingBookmark, setEditingBookmark] = useState<
    Bookmark | undefined
  >();
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeProjectFilter, setActiveProjectFilter] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [user, authLoading, router]);

  const handleUrlDetected = useCallback(
    (url: string) => {
      if (modalOpen || projectModalOpen) return;
      setModalUrl(url);
      setEditingBookmark(undefined);
      setModalOpen(true);
    },
    [modalOpen, projectModalOpen]
  );

  useClipboard(handleUrlDetected);

  const filtered = useMemo(() => {
    let result = bookmarks;

    // Project filter
    if (activeProjectFilter) {
      result = result.filter(
        (b) => b.projectIds && b.projectIds.includes(activeProjectFilter)
      );
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (b) =>
          b.url.toLowerCase().includes(q) ||
          b.title.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q)
      );
    }

    return result;
  }, [bookmarks, search, activeProjectFilter]);

  async function handleSave(data: {
    url: string;
    title: string;
    description: string;
    thumbnail: string;
    favicon: string;
    projectIds: string[];
  }) {
    if (!user) return;
    try {
      if (editingBookmark) {
        await updateBookmark(user.uid, editingBookmark.id, data);
        showToast("Updated");
      } else {
        await addBookmark(user.uid, data);
        showToast("Saved to Markd");
      }
      setModalOpen(false);
      setModalUrl(undefined);
      setEditingBookmark(undefined);
    } catch {
      showToast("Something went wrong", "error");
    }
  }

  async function handleDelete(id: string) {
    if (!user) return;
    try {
      await deleteBookmark(user.uid, id);
      showToast("Deleted");
    } catch {
      showToast("Failed to delete", "error");
    }
  }

  async function handleUpdateProjectIds(
    bookmarkId: string,
    projectIds: string[]
  ) {
    if (!user) return;
    try {
      await updateBookmark(user.uid, bookmarkId, { projectIds });
    } catch {
      showToast("Failed to update", "error");
    }
  }

  async function handleSaveProject(
    data: Omit<Project, "id" | "createdAt">
  ) {
    if (!user) return;
    try {
      await addProject(user.uid, data);
      showToast("Project created");
      setProjectModalOpen(false);
    } catch {
      showToast("Something went wrong", "error");
    }
  }

  if (authLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <div className="spinner" />
      </div>
    );
  }

  if (!user) return null;

  const loading = bookmarksLoading;

  return (
    <>
      <SearchBar value={search} onChange={setSearch} />

      {/* Project filter pills */}
      {projects.length > 0 && (
        <div
          style={{
            position: "fixed",
            top: 72,
            left: 0,
            right: 0,
            zIndex: 39,
            padding: "0 16px",
          }}
        >
          <div
            style={{
              maxWidth: 1200,
              margin: "0 auto",
              display: "flex",
              gap: 8,
              overflowX: "auto",
              paddingBottom: 8,
              msOverflowStyle: "none",
              scrollbarWidth: "none",
            }}
          >
            <button
              onClick={() => setActiveProjectFilter(null)}
              style={{
                flexShrink: 0,
                padding: "6px 16px",
                borderRadius: 999,
                border: "1px solid var(--color-border)",
                cursor: "pointer",
                fontSize: "var(--text-body-sm)",
                fontFamily: "inherit",
                fontWeight: activeProjectFilter === null ? 500 : 400,
                background:
                  activeProjectFilter === null
                    ? "var(--color-text-primary)"
                    : "var(--color-surface)",
                color:
                  activeProjectFilter === null
                    ? "var(--color-bg)"
                    : "var(--color-text-secondary)",
                transition: "all 0.15s",
              }}
            >
              All
            </button>
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() =>
                  setActiveProjectFilter(
                    activeProjectFilter === project.id ? null : project.id
                  )
                }
                style={{
                  flexShrink: 0,
                  padding: "6px 16px",
                  borderRadius: 999,
                  border: "1px solid var(--color-border)",
                  cursor: "pointer",
                  fontSize: "var(--text-body-sm)",
                  fontFamily: "inherit",
                  fontWeight:
                    activeProjectFilter === project.id ? 500 : 400,
                  background:
                    activeProjectFilter === project.id
                      ? "var(--color-text-primary)"
                      : "var(--color-surface)",
                  color:
                    activeProjectFilter === project.id
                      ? "var(--color-bg)"
                      : "var(--color-text-secondary)",
                  transition: "all 0.15s",
                }}
              >
                {project.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <main
        style={{
          paddingTop: projects.length > 0 ? 112 : 80,
          paddingBottom: 100,
          paddingLeft: 16,
          paddingRight: 16,
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        {loading ? (
          <LoadingSkeleton />
        ) : bookmarks.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "60vh",
              gap: 12,
            }}
          >
            <BookmarkIcon
              size={48}
              style={{ color: "var(--color-text-tertiary)" }}
            />
            <span
              style={{
                fontSize: "var(--text-h3)",
                fontWeight: 600,
                color: "var(--color-text-primary)",
              }}
            >
              Nothing saved yet
            </span>
            <span
              style={{
                fontSize: "var(--text-body-sm)",
                color: "var(--color-text-secondary)",
              }}
            >
              Paste a link to get started
            </span>
          </div>
        ) : filtered.length === 0 ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "60vh",
            }}
          >
            <span
              style={{
                fontSize: "var(--text-body-sm)",
                color: "var(--color-text-secondary)",
              }}
            >
              No results for your search
            </span>
          </div>
        ) : (
          <MasonryGrid>
            {filtered.map((bookmark) => (
              <BookmarkCard
                key={bookmark.id}
                bookmark={bookmark}
                projects={projects}
                onDelete={() => handleDelete(bookmark.id)}
                onUpdateProjectIds={(ids) =>
                  handleUpdateProjectIds(bookmark.id, ids)
                }
              />
            ))}
          </MasonryGrid>
        )}
      </main>

      <BottomNav
        user={user}
        isMenuOpen={menuOpen}
        onToggleMenu={() => setMenuOpen(!menuOpen)}
        onAddBookmark={() => {
          setModalUrl(undefined);
          setEditingBookmark(undefined);
          setModalOpen(true);
        }}
        onAddProject={() => {
          setProjectModalOpen(true);
        }}
      />

      {modalOpen && (
        <BookmarkModal
          initialUrl={modalUrl}
          bookmark={editingBookmark}
          existingBookmarks={bookmarks}
          projects={projects}
          onSave={handleSave}
          onClose={() => {
            setModalOpen(false);
            setModalUrl(undefined);
            setEditingBookmark(undefined);
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
