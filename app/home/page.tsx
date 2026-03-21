"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Bookmark as BookmarkIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useClipboard } from "@/hooks/useClipboard";
import { useToastContext } from "@/app/ToastProvider";
import { addBookmark, deleteBookmark, updateBookmark } from "@/lib/bookmarks";
import { Bookmark } from "@/types/bookmark";
import SearchBar from "@/components/SearchBar";
import MasonryGrid from "@/components/MasonryGrid";
import BookmarkCard from "@/components/BookmarkCard";
import BookmarkModal from "@/components/BookmarkModal";
import BottomNav from "@/components/BottomNav";
import LoadingSkeleton from "@/components/LoadingSkeleton";

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const { bookmarks, loading: bookmarksLoading } = useBookmarks(
    user?.uid
  );
  const { showToast } = useToastContext();
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalUrl, setModalUrl] = useState<string | undefined>();
  const [editingBookmark, setEditingBookmark] = useState<
    Bookmark | undefined
  >();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [user, authLoading, router]);

  const handleUrlDetected = useCallback(
    (url: string) => {
      // Don't intercept if modal is already open or search is focused
      if (modalOpen) return;
      setModalUrl(url);
      setEditingBookmark(undefined);
      setModalOpen(true);
    },
    [modalOpen]
  );

  useClipboard(handleUrlDetected);

  const filtered = useMemo(() => {
    if (!search.trim()) return bookmarks;
    const q = search.toLowerCase();
    return bookmarks.filter(
      (b) =>
        b.url.toLowerCase().includes(q) ||
        b.title.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q)
    );
  }, [bookmarks, search]);

  async function handleSave(data: {
    url: string;
    title: string;
    description: string;
    thumbnail: string;
    favicon: string;
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

      <main
        style={{
          paddingTop: 80,
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
                onDelete={() => handleDelete(bookmark.id)}
              />
            ))}
          </MasonryGrid>
        )}
      </main>

      <BottomNav
        user={user}
        onAddClick={() => {
          setModalUrl(undefined);
          setEditingBookmark(undefined);
          setModalOpen(true);
        }}
      />

      {modalOpen && (
        <BookmarkModal
          initialUrl={modalUrl}
          bookmark={editingBookmark}
          onSave={handleSave}
          onClose={() => {
            setModalOpen(false);
            setModalUrl(undefined);
            setEditingBookmark(undefined);
          }}
        />
      )}
    </>
  );
}
