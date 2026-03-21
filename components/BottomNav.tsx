"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Plus } from "lucide-react";
import { User } from "firebase/auth";

interface BottomNavProps {
  user: User | null;
  onAddClick: () => void;
}

export default function BottomNav({ user, onAddClick }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className="shadow-float"
      style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        background: "var(--color-nav-bg)",
        backdropFilter: "blur(12px)",
        borderRadius: 999,
        border: "1px solid var(--color-border)",
        padding: "12px 24px",
        display: "flex",
        alignItems: "center",
        gap: 24,
        zIndex: 40,
      }}
    >
      <Link
        href="/home"
        style={{
          display: "flex",
          alignItems: "center",
          color:
            pathname === "/home"
              ? "var(--color-text-primary)"
              : "var(--color-text-tertiary)",
          transition: "color 0.15s",
        }}
      >
        <Home size={24} />
      </Link>

      <button
        onClick={onAddClick}
        style={{
          display: "flex",
          alignItems: "center",
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--color-text-primary)",
          padding: 0,
        }}
      >
        <Plus size={28} />
      </button>

      <Link
        href="/profile"
        style={{
          display: "flex",
          alignItems: "center",
          textDecoration: "none",
        }}
      >
        {user?.photoURL ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.photoURL}
            alt=""
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              objectFit: "cover",
              border:
                pathname === "/profile"
                  ? "2px solid var(--color-text-primary)"
                  : "2px solid transparent",
            }}
          />
        ) : (
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "var(--color-surface)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "var(--text-body-sm)",
              fontWeight: 600,
              color:
                pathname === "/profile"
                  ? "var(--color-text-primary)"
                  : "var(--color-text-tertiary)",
              border:
                pathname === "/profile"
                  ? "2px solid var(--color-text-primary)"
                  : "2px solid transparent",
            }}
          >
            {user?.displayName?.[0]?.toUpperCase() || "?"}
          </div>
        )}
      </Link>
    </nav>
  );
}
