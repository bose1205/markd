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

function bookmarksCollection(uid: string) {
  return collection(db, "users", uid, "bookmarks");
}

export function subscribeToBookmarks(
  uid: string,
  callback: (bookmarks: Bookmark[]) => void
) {
  const q = query(bookmarksCollection(uid), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const bookmarks: Bookmark[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Bookmark[];
    callback(bookmarks);
  });
}

export async function addBookmark(
  uid: string,
  data: Omit<Bookmark, "id" | "createdAt">
) {
  return addDoc(bookmarksCollection(uid), {
    ...data,
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
