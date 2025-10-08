import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PoolHub.Live",
  description: "Profiles, live streams, and events for pool players.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-black">
       {/* header nav added */}
         <header className="border-b">
          <div className="mx-auto max-w-5xl p-4 flex items-center justify-between">
            <a href="/" className="font-bold text-xl">PoolHub.Live</a>
            <nav className="flex gap-4 text-sm">
              <a href="/feed">Feed</a>
              <a href="/live">Live</a>
              <a href="/events">Events</a>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl p-6">{children}</main>
      </body>
    </html>
  );
}
