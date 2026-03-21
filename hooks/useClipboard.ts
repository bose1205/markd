"use client";

import { useEffect } from "react";

function isValidUrl(str: string): boolean {
  try {
    const url = new URL(str);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function useClipboard(onUrlDetected: (url: string) => void) {
  useEffect(() => {
    function handlePaste(e: ClipboardEvent) {
      const text = e.clipboardData?.getData("text/plain")?.trim();
      if (text && isValidUrl(text)) {
        e.preventDefault();
        onUrlDetected(text);
      }
    }

    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [onUrlDetected]);
}
