import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PashtoPro — Learn Pashto",
  description:
    "A gamified, AI-powered app for learning Pashto with real-time pronunciation scoring.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen text-slate-800 antialiased">
        {children}
      </body>
    </html>
  );
}
