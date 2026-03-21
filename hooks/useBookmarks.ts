"use client";

import { useState, useEffect } from "react";
import { Bookmark } from "@/types/bookmark";
import { subscribeToBookmarks } from "@/lib/bookmarks";

export function useBookmarks(uid: string | undefined) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setBookmarks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToBookmarks(uid, (data) => {
      setBookmarks(data);
      setLoading(false);
    });
    return unsubscribe;
  }, [uid]);

  return { bookmarks, loading };
}
