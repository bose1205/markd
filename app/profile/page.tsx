"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useToastContext } from "@/app/ToastProvider";
import { signOutUser } from "@/lib/auth";
import { auth, db } from "@/lib/firebase";
import { deleteUser, updateProfile } from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  getDocs,
  collection,
  writeBatch,
} from "firebase/firestore";
import BottomNav from "@/components/BottomNav";

// ─── Confirmation Modal ─────────────────────────────────────
function ConfirmModal({
  title,
  message,
  confirmLabel,
  onConfirm,
  onClose,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "var(--color-overlay)",
        backdropFilter: "blur(4px)",
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="shadow-float"
        style={{
          background: "var(--color-bg)",
          borderRadius: 24,
          maxWidth: 360,
          width: "calc(100% - 32px)",
          padding: 24,
        }}
      >
        <h2
          style={{
            fontSize: "var(--text-h3)",
            fontWeight: 700,
            color: "var(--color-text-primary)",
            margin: 0,
          }}
        >
          {title}
        </h2>
        <p
          style={{
            fontSize: "var(--text-body-sm)",
            color: "var(--color-text-secondary)",
            marginTop: 8,
            marginBottom: 0,
            lineHeight: 1.5,
          }}
        >
          {message}
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 12,
            marginTop: 24,
          }}
        >
          <button
            onClick={onConfirm}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--color-destructive)",
              fontSize: "var(--text-body-sm)",
              padding: "12px 16px",
              fontFamily: "inherit",
            }}
          >
            {confirmLabel}
          </button>
          <button
            onClick={onClose}
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: 16,
              cursor: "pointer",
              color: "var(--color-text-primary)",
              fontSize: "var(--text-body-sm)",
              padding: "12px 24px",
              fontWeight: 500,
              fontFamily: "inherit",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Toggle Switch ──────────────────────────────────────────
function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      style={{
        width: 44,
        height: 24,
        borderRadius: 999,
        border: "none",
        cursor: "pointer",
        background: checked
          ? "var(--color-text-primary)"
          : "var(--color-border)",
        position: "relative",
        transition: "background 0.2s",
        flexShrink: 0,
        padding: 0,
      }}
    >
      <div
        style={{
          width: 20,
          height: 20,
          borderRadius: 999,
          background: "var(--color-bg)",
          position: "absolute",
          top: 2,
          left: checked ? 22 : 2,
          transition: "left 0.2s",
        }}
      />
    </button>
  );
}

// ─── Settings Row ───────────────────────────────────────────
function SettingsRow({
  label,
  onClick,
  color,
  trailing,
}: {
  label: string;
  onClick?: () => void;
  color?: string;
  trailing?: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 8px",
        borderBottom: "1px solid var(--color-border)",
        cursor: onClick ? "pointer" : "default",
        background:
          hovered && onClick ? "var(--color-surface-hover)" : "transparent",
        transition: "background 0.15s",
        borderRadius: 12,
      }}
    >
      <span
        style={{
          fontSize: "var(--text-body-lg)",
          color: color || "var(--color-text-primary)",
        }}
      >
        {label}
      </span>
      {trailing ||
        (onClick ? (
          <ChevronRight
            size={20}
            style={{ color: "var(--color-text-tertiary)" }}
          />
        ) : null)}
    </div>
  );
}

// ─── Section Label ──────────────────────────────────────────
function SectionLabel({ children }: { children: string }) {
  return (
    <div
      style={{
        fontSize: "var(--text-caption)",
        color: "var(--color-text-tertiary)",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        padding: "16px 0 8px",
        fontWeight: 600,
      }}
    >
      {children}
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────
export default function ProfilePage() {
  const { user, loading } = useAuth();
  const { bookmarks } = useBookmarks(user?.uid);
  const { showToast } = useToastContext();
  const router = useRouter();

  const [showEditForm, setShowEditForm] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [about, setAbout] = useState("");
  const [aboutLoaded, setAboutLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notifications, setNotifications] = useState(false);

  const [modal, setModal] = useState<
    "sign-out" | "delete-account" | "clear-bookmarks" | null
  >(null);

  // Load about text + notification preference
  useEffect(() => {
    if (!user) return;

    const parts = (user.displayName || "").split(" ");
    setFirstName(parts[0] || "");
    setLastName(parts.slice(1).join(" ") || "");

    getDoc(doc(db, "users", user.uid, "profile", "about"))
      .then((snap) => {
        if (snap.exists()) {
          setAbout(snap.data().text || "");
        }
      })
      .catch(() => {
        // May fail if Firestore rules don't cover this path yet
      })
      .finally(() => {
        setAboutLoaded(true);
      });

    const stored = localStorage.getItem("markd-notifications");
    if (stored === "true") setNotifications(true);
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  const handleNotificationToggle = useCallback((val: boolean) => {
    setNotifications(val);
    localStorage.setItem("markd-notifications", String(val));
  }, []);

  async function handleSaveProfile() {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    setSaving(true);
    try {
      const newDisplayName = `${firstName.trim()} ${lastName.trim()}`.trim();
      await updateProfile(currentUser, { displayName: newDisplayName });
      await setDoc(doc(db, "users", currentUser.uid, "profile", "about"), {
        text: about.trim(),
      });
      showToast("Profile updated");
      setShowEditForm(false);
    } catch (err) {
      console.error("Profile save failed:", err);
      showToast("Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
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

  async function handleClearAllBookmarks() {
    if (!user) return;
    try {
      const snapshot = await getDocs(
        collection(db, "users", user.uid, "bookmarks")
      );
      const batch = writeBatch(db);
      snapshot.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
      showToast("All bookmarks deleted");
    } catch {
      showToast("Failed to clear bookmarks", "error");
    }
  }

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

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 16px",
    fontSize: "var(--text-body-sm)",
    border: "1px solid var(--color-border)",
    borderRadius: 16,
    outline: "none",
    background: "var(--color-bg)",
    color: "var(--color-text-primary)",
    fontFamily: "inherit",
  };

  return (
    <>
      <main
        style={{
          maxWidth: 600,
          margin: "0 auto",
          padding: 24,
          paddingBottom: 100,
        }}
      >
        {/* ── Profile Header ── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingTop: 32,
          }}
        >
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
              }}
            >
              {user.displayName?.[0]?.toUpperCase() || "?"}
            </div>
          )}

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

          <button
            onClick={() => setShowEditForm(!showEditForm)}
            style={{
              marginTop: 16,
              padding: "8px 20px",
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: 999,
              cursor: "pointer",
              fontSize: "var(--text-body-sm)",
              color: "var(--color-text-primary)",
              fontFamily: "inherit",
              fontWeight: 500,
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--color-surface-hover)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "var(--color-surface)")
            }
          >
            Edit profile
          </button>
        </div>

        {/* ── Edit Profile Form ── */}
        {showEditForm && aboutLoaded && (
          <div
            style={{
              marginTop: 24,
              padding: 24,
              background: "var(--color-surface)",
              borderRadius: 24,
              border: "1px solid var(--color-border)",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label
                  style={{
                    fontSize: "var(--text-caption)",
                    color: "var(--color-text-secondary)",
                    display: "block",
                    marginBottom: 4,
                  }}
                >
                  First name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label
                  style={{
                    fontSize: "var(--text-caption)",
                    color: "var(--color-text-secondary)",
                    display: "block",
                    marginBottom: 4,
                  }}
                >
                  Last name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ position: "relative" }}>
              <label
                style={{
                  fontSize: "var(--text-caption)",
                  color: "var(--color-text-secondary)",
                  display: "block",
                  marginBottom: 4,
                }}
              >
                About
              </label>
              <textarea
                value={about}
                onChange={(e) => {
                  if (e.target.value.length <= 200) setAbout(e.target.value);
                }}
                placeholder="Tell your story"
                rows={4}
                style={{
                  ...inputStyle,
                  resize: "none",
                }}
              />
              <span
                style={{
                  position: "absolute",
                  bottom: 8,
                  right: 12,
                  fontSize: "var(--text-caption)",
                  color: "var(--color-text-tertiary)",
                }}
              >
                {about.length} / 200
              </span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 12,
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setShowEditForm(false);
                  const parts = (user.displayName || "").split(" ");
                  setFirstName(parts[0] || "");
                  setLastName(parts.slice(1).join(" ") || "");
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--color-text-secondary)",
                  fontSize: "var(--text-body-sm)",
                  padding: "12px 24px",
                  fontFamily: "inherit",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={saving}
                style={{
                  background: "var(--color-text-primary)",
                  border: "none",
                  borderRadius: 16,
                  cursor: saving ? "default" : "pointer",
                  color: "var(--color-bg)",
                  fontSize: "var(--text-body-sm)",
                  padding: "12px 24px",
                  fontWeight: 600,
                  fontFamily: "inherit",
                  opacity: saving ? 0.6 : 1,
                }}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        )}

        {/* ── Settings: ACCOUNT ── */}
        <div style={{ marginTop: 32 }}>
          <SectionLabel>Account</SectionLabel>
          <SettingsRow
            label="Edit profile"
            onClick={() => setShowEditForm(true)}
          />
          <SettingsRow
            label="Notifications"
            trailing={
              <Toggle
                checked={notifications}
                onChange={handleNotificationToggle}
              />
            }
          />
        </div>

        {/* ── Settings: PRIVACY & DATA ── */}
        <div style={{ marginTop: 32 }}>
          <SectionLabel>Privacy & Data</SectionLabel>
          <SettingsRow
            label="Privacy policy"
            onClick={() =>
              window.open(
                "https://policies.google.com/privacy",
                "_blank",
                "noopener"
              )
            }
          />
          <SettingsRow
            label="Terms of service"
            onClick={() =>
              window.open(
                "https://policies.google.com/terms",
                "_blank",
                "noopener"
              )
            }
          />
          <SettingsRow
            label="Download my data"
            onClick={() => showToast("Coming soon")}
          />
          <SettingsRow
            label="Clear all bookmarks"
            onClick={() => setModal("clear-bookmarks")}
          />
        </div>

        {/* ── Settings: ACCOUNT ACTIONS ── */}
        <div style={{ marginTop: 32 }}>
          <SectionLabel>Account Actions</SectionLabel>
          <SettingsRow
            label="Sign out"
            onClick={() => setModal("sign-out")}
          />
          <SettingsRow
            label="Delete account"
            color="var(--color-destructive)"
            onClick={() => setModal("delete-account")}
          />
        </div>
      </main>

      <BottomNav user={user} onAddClick={() => router.push("/home")} />

      {/* ── Modals ── */}
      {modal === "sign-out" && (
        <ConfirmModal
          title="Sign out?"
          message="You can always sign back in later."
          confirmLabel="Sign out"
          onConfirm={() => {
            setModal(null);
            handleSignOut();
          }}
          onClose={() => setModal(null)}
        />
      )}

      {modal === "delete-account" && (
        <ConfirmModal
          title="Delete account?"
          message="Your account and all bookmarks will be permanently deleted."
          confirmLabel="Delete account"
          onConfirm={() => {
            setModal(null);
            handleDeleteAccount();
          }}
          onClose={() => setModal(null)}
        />
      )}

      {modal === "clear-bookmarks" && (
        <ConfirmModal
          title="Clear all bookmarks?"
          message={`This will permanently delete all ${bookmarks.length} bookmark${bookmarks.length !== 1 ? "s" : ""}. This cannot be undone.`}
          confirmLabel="Delete all"
          onConfirm={() => {
            setModal(null);
            handleClearAllBookmarks();
          }}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}
