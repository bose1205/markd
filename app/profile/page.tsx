"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useToastContext } from "@/app/ToastProvider";
import { signOutUser } from "@/lib/auth";
import { auth } from "@/lib/firebase";
import { deleteUser } from "firebase/auth";
import BottomNav from "@/components/BottomNav";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const { bookmarks } = useBookmarks(user?.uid);
  const { showToast } = useToastContext();
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
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

  async function handleSignOut() {
    await signOutUser();
    router.replace("/login");
  }

  async function handleDeleteAccount() {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        await deleteUser(currentUser);
        router.replace("/login");
      }
    } catch {
      showToast("Please sign in again to delete your account", "error");
    }
  }

  return (
    <>
      <main
        style={{
          maxWidth: 480,
          margin: "0 auto",
          padding: 24,
          paddingBottom: 100,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Avatar */}
        {user.photoURL ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.photoURL}
            alt=""
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              objectFit: "cover",
              marginTop: 48,
            }}
          />
        ) : (
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "var(--color-surface)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "var(--text-h1)",
              fontWeight: 600,
              color: "var(--color-text-primary)",
              marginTop: 48,
            }}
          >
            {user.displayName?.[0]?.toUpperCase() || "?"}
          </div>
        )}

        {/* Name */}
        <h1
          style={{
            fontSize: "var(--text-h2)",
            fontWeight: 700,
            marginTop: 16,
            marginBottom: 0,
          }}
        >
          {user.displayName || "User"}
        </h1>

        {/* Email */}
        <p
          style={{
            fontSize: "var(--text-body-sm)",
            color: "var(--color-text-secondary)",
            marginTop: 4,
            marginBottom: 0,
          }}
        >
          {user.email}
        </p>

        {/* Bookmark count */}
        <p
          style={{
            fontSize: "var(--text-body-sm)",
            color: "var(--color-text-tertiary)",
            marginTop: 8,
            marginBottom: 0,
          }}
        >
          {bookmarks.length} bookmark{bookmarks.length !== 1 ? "s" : ""}{" "}
          saved
        </p>

        {/* Actions */}
        <div
          style={{
            marginTop: 48,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <button
            onClick={handleSignOut}
            style={{
              width: "100%",
              padding: "12px 24px",
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: 16,
              cursor: "pointer",
              fontSize: "var(--text-body-sm)",
              color: "var(--color-text-primary)",
              fontFamily: "inherit",
              fontWeight: 500,
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background =
                "var(--color-surface-hover)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "var(--color-surface)")
            }
          >
            Sign out
          </button>

          {showDeleteConfirm ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                padding: 16,
                background: "var(--color-surface)",
                borderRadius: 16,
                border: "1px solid var(--color-border)",
              }}
            >
              <p
                style={{
                  fontSize: "var(--text-body-sm)",
                  color: "var(--color-text-primary)",
                  margin: 0,
                  textAlign: "center",
                }}
              >
                Are you sure? This cannot be undone.
              </p>
              <div
                style={{ display: "flex", gap: 8, justifyContent: "center" }}
              >
                <button
                  onClick={handleDeleteAccount}
                  style={{
                    padding: "8px 20px",
                    background: "none",
                    border: "1px solid var(--color-destructive)",
                    borderRadius: 16,
                    cursor: "pointer",
                    fontSize: "var(--text-body-sm)",
                    color: "var(--color-destructive)",
                    fontFamily: "inherit",
                    fontWeight: 500,
                  }}
                >
                  Yes, delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  style={{
                    padding: "8px 20px",
                    background: "none",
                    border: "1px solid var(--color-border)",
                    borderRadius: 16,
                    cursor: "pointer",
                    fontSize: "var(--text-body-sm)",
                    color: "var(--color-text-secondary)",
                    fontFamily: "inherit",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              style={{
                width: "100%",
                padding: "12px 24px",
                background: "none",
                border: "1px solid var(--color-border)",
                borderRadius: 16,
                cursor: "pointer",
                fontSize: "var(--text-body-sm)",
                color: "var(--color-destructive)",
                fontFamily: "inherit",
                fontWeight: 500,
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background =
                  "var(--color-surface)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              Delete account
            </button>
          )}
        </div>
      </main>

      <BottomNav user={user} onAddClick={() => router.push("/home")} />
    </>
  );
}
