import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { EditorShell } from "@/components/editor/editor-shell";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ghost AI",
  description: "Real-time collaborative system design workspace",
};

/**
 * Application root layout that applies global fonts and wraps page content with EditorShell.
 *
 * Renders the top-level `<html>` and `<body>` elements, applies Geist Sans and Geist Mono font
 * CSS variables plus base layout classes, and places `children` inside the `EditorShell`.
 *
 * @param children - Page content to render inside the `EditorShell`
 * @returns A JSX element representing the application's root HTML layout
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <EditorShell>{children}</EditorShell>
      </body>
    </html>
  );
}
