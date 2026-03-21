"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Pencil, FolderOpen } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useProjects } from "@/hooks/useProjects";
import { useToastContext } from "@/app/ToastProvider";
import {
  deleteBookmark,
  updateBookmark,
  updateProject,
} from "@/lib/bookmarks";
import { Project } from "@/types/project";
import SearchBar from "@/components/SearchBar";
import MasonryGrid from "@/components/MasonryGrid";
import BookmarkCard from "@/components/BookmarkCard";
import ProjectModal from "@/components/ProjectModal";
import BottomNav from "@/components/BottomNav";
import LoadingSkeleton from "@/components/LoadingSkeleton";

export default function ProjectPage() {
  const { user, loading: authLoading } = useAuth();
  const { bookmarks, loading: bookmarksLoading } = useBookmarks(user?.uid);
  const { projects } = useProjects(user?.uid);
  const { showToast } = useToastContext();
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [search, setSearch] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [user, authLoading, router]);

  const project = projects.find((p) => p.id === projectId);

  const projectBookmarks = useMemo(() => {
    return bookmarks.filter(
      (b) => b.projectIds && b.projectIds.includes(projectId)
    );
  }, [bookmarks, projectId]);

  const filtered = useMemo(() => {
    if (!search.trim()) return projectBookmarks;
    const q = search.toLowerCase();
    return projectBookmarks.filter(
      (b) =>
        b.url.toLowerCase().includes(q) ||
        b.title.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q)
    );
  }, [projectBookmarks, search]);

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

  async function handleEditProject(
    data: Omit<Project, "id" | "createdAt">
  ) {
    if (!user) return;
    try {
      await updateProject(user.uid, projectId, data);
      showToast("Project updated");
      setEditModalOpen(false);
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

  return (
    <>
      <SearchBar value={search} onChange={setSearch} />

      {/* Project header */}
      <div
        style={{
          position: "fixed",
          top: 72,
          left: 0,
          right: 0,
          zIndex: 39,
          padding: "12px 16px",
          background: "var(--color-bg)",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <button
            onClick={() => router.push("/home")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 4,
              display: "flex",
              color: "var(--color-text-primary)",
            }}
          >
            <ArrowLeft size={24} />
          </button>

          <div style={{ textAlign: "center", flex: 1 }}>
            <div
              style={{
                fontSize: "var(--text-h2)",
                fontWeight: 700,
                color: "var(--color-text-primary)",
              }}
            >
              {project?.name || "Project"}
            </div>
            {project?.description && (
              <div
                style={{
                  fontSize: "var(--text-body-sm)",
                  color: "var(--color-text-secondary)",
                  marginTop: 4,
                }}
              >
                {project.description}
              </div>
            )}
          </div>

          <button
            onClick={() => setEditModalOpen(true)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 4,
              display: "flex",
              color: "var(--color-text-tertiary)",
            }}
          >
            <Pencil size={20} />
          </button>
        </div>
      </div>

      <main
        style={{
          paddingTop: project?.description ? 148 : 124,
          paddingBottom: 100,
          paddingLeft: 16,
          paddingRight: 16,
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        {bookmarksLoading ? (
          <LoadingSkeleton />
        ) : projectBookmarks.length === 0 ? (
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
            <FolderOpen
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
              This project is empty
            </span>
            <span
              style={{
                fontSize: "var(--text-body-sm)",
                color: "var(--color-text-secondary)",
              }}
            >
              Add bookmarks to this project from the home screen
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
        onAddClick={() => router.push("/home")}
      />

      {editModalOpen && project && (
        <ProjectModal
          project={project}
          onSave={handleEditProject}
          onClose={() => setEditModalOpen(false)}
        />
      )}
    </>
  );
}
