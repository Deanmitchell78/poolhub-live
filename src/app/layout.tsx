
import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "PoolHub.Live",
  description: "Profiles, live streams, and events for pool players.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-black">
        <header className="border-b">
          <div className="mx-auto max-w-5xl p-4 flex items-center justify-between">
            <Link href="/" className="font-bold text-xl">PoolHub.Live</Link>
            <nav className="flex gap-4 text-sm">
              <nav className="flex gap-4 text-sm">
               <Link href="/feed">Feed</Link>
               <Link href="/live">Live</Link>
               <Link href="/events">Events</Link>
               <Link href="/settings">Settings</Link>
</nav>

            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl p-6">{children}</main>
      </body>
    </html>
  );
}
