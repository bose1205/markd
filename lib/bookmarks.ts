import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  query,
  orderBy,
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

// ─── Bookmarks ──────────────────────────────────────────────

export function subscribeToBookmarks(
  uid: string,
  callback: (bookmarks: Bookmark[]) => void
) {
  const q = query(bookmarksCollection(uid), orderBy("createdAt", "desc"));
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
  return addDoc(bookmarksCollection(uid), {
    ...data,
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
  return updateDoc(doc(db, "users", uid, "bookmarks", id), data);
}

// ─── Projects ───────────────────────────────────────────────

export function subscribeToProjects(
  uid: string,
  callback: (projects: Project[]) => void
) {
  const q = query(projectsCollection(uid), orderBy("createdAt", "desc"));
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
  return addDoc(projectsCollection(uid), {
    ...data,
    createdAt: Date.now(),
  });
}

export async function updateProject(
  uid: string,
  id: string,
  data: Partial<Project>
) {
  return updateDoc(doc(db, "users", uid, "projects", id), data);
}

export async function deleteProject(uid: string, id: string) {
  return deleteDoc(doc(db, "users", uid, "projects", id));
}
