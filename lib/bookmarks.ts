import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "./firebase";
import { Bookmark } from "@/types/bookmark";
import { Project } from "@/types/project";

function bookmarksCollection(uid: string) {
  return collection(db, "users", uid, "bookmarks");
}

function projectsCollection(uid: string) {
  return collection(db, "users", uid, "projects");
}

// ─── Sanitisation ───────────────────────────────────────────

function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, "");
}

function sanitiseBookmark(
  data: Partial<Omit<Bookmark, "id" | "createdAt">>
): Partial<Omit<Bookmark, "id" | "createdAt">> {
  const sanitised = { ...data };

  if (sanitised.url !== undefined) {
    sanitised.url = sanitised.url.trim();
    if (
      !sanitised.url.startsWith("http://") &&
      !sanitised.url.startsWith("https://")
    ) {
      throw new Error("Invalid URL");
    }
  }

  if (sanitised.title !== undefined) {
    sanitised.title = stripHtml(sanitised.title.trim()).slice(0, 200);
  }

  if (sanitised.description !== undefined) {
    sanitised.description = stripHtml(sanitised.description.trim()).slice(
      0,
      300
    );
  }

  return sanitised;
}

function sanitiseProject(
  data: Partial<Omit<Project, "id" | "createdAt">>
): Partial<Omit<Project, "id" | "createdAt">> {
  const sanitised = { ...data };

  if (sanitised.name !== undefined) {
    sanitised.name = stripHtml(sanitised.name.trim()).slice(0, 100);
    if (!sanitised.name) {
      throw new Error("Project name required");
    }
  }

  if (sanitised.description !== undefined) {
    sanitised.description = stripHtml(sanitised.description.trim()).slice(
      0,
      200
    );
  }

  return sanitised;
}

// ─── Bookmarks ──────────────────────────────────────────────

export function subscribeToBookmarks(
  uid: string,
  callback: (bookmarks: Bookmark[]) => void
) {
  const q = query(
    bookmarksCollection(uid),
    orderBy("createdAt", "desc"),
    limit(500)
  );
  return onSnapshot(q, (snapshot) => {
    const bookmarks = snapshot.docs.map((d) => {
      const data = d.data();
      return {
        ...data,
        id: d.id,
        projectIds: (data.projectIds as string[]) || [],
      } as Bookmark;
    });
    callback(bookmarks);
  });
}

export async function addBookmark(
  uid: string,
  data: Omit<Bookmark, "id" | "createdAt">
) {
  const sanitised = sanitiseBookmark(data);
  return addDoc(bookmarksCollection(uid), {
    ...sanitised,
    projectIds: data.projectIds || [],
    createdAt: Date.now(),
  });
}

export async function deleteBookmark(uid: string, id: string) {
  return deleteDoc(doc(db, "users", uid, "bookmarks", id));
}

export async function updateBookmark(
  uid: string,
  id: string,
  data: Partial<Bookmark>
) {
  const sanitised = sanitiseBookmark(data);
  return updateDoc(doc(db, "users", uid, "bookmarks", id), sanitised);
}

// ─── Projects ───────────────────────────────────────────────

export function subscribeToProjects(
  uid: string,
  callback: (projects: Project[]) => void
) {
  const q = query(
    projectsCollection(uid),
    orderBy("createdAt", "desc"),
    limit(50)
  );
  return onSnapshot(q, (snapshot) => {
    const projects: Project[] = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as Project[];
    callback(projects);
  });
}

export async function addProject(
  uid: string,
  data: Omit<Project, "id" | "createdAt">
) {
  const sanitised = sanitiseProject(data);
  return addDoc(projectsCollection(uid), {
    ...sanitised,
    createdAt: Date.now(),
  });
}

export async function updateProject(
  uid: string,
  id: string,
  data: Partial<Project>
) {
  const sanitised = sanitiseProject(data);
  return updateDoc(doc(db, "users", uid, "projects", id), sanitised);
}

export async function deleteProject(uid: string, id: string) {
  return deleteDoc(doc(db, "users", uid, "projects", id));
}
