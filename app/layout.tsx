import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ToastProvider } from "./ToastProvider";

const geist = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Markd",
  description: "Save anything. Find it instantly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={geist.variable}
        style={{
          fontFamily: "var(--font-geist), sans-serif",
          background: "var(--color-bg)",
          color: "var(--color-text-primary)",
          minHeight: "100vh",
          margin: 0,
        }}
      >
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
