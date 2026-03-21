"use client";

import { useState, useEffect } from "react";
import { Project } from "@/types/project";
import { subscribeToProjects } from "@/lib/bookmarks";

export function useProjects(uid: string | undefined) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setProjects([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToProjects(uid, (data) => {
      setProjects(data);
      setLoading(false);
    });
    return unsubscribe;
  }, [uid]);

  return { projects, loading };
}
