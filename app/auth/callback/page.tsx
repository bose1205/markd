"use client";

import { useEffect } from "react";
import { getRedirectResult } from "@/lib/auth";
import { auth } from "@/lib/firebase";

export default function AuthCallbackPage() {
  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          window.location.href = "/home";
        } else {
          window.location.href = "/login";
        }
      })
      .catch(() => {
        window.location.href = "/login";
      });
  }, []);

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
