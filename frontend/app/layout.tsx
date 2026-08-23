import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PashtoPro — Learn Pashto",
  description: "A gamified, AI-powered app for learning Pashto.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className="min-h-screen antialiased text-slate-100"
        style={{
          backgroundImage: "url('/bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center top",
          backgroundAttachment: "fixed",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Dark overlay so text stays readable over the bg image */}
        <div
          className="fixed inset-0 -z-10"
          style={{ background: "linear-gradient(160deg, rgba(10,15,30,0.82) 0%, rgba(10,20,35,0.90) 100%)" }}
        />
        {children}
      </body>
    </html>
  );
}
