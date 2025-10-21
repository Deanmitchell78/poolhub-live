export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import "./globals.css";
import Link from "next/link";
import HeaderAuthControls from "@/components/HeaderAuthControls";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b">
          <nav className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
            <Link href="/" className="font-bold text-lg">PoolHub.Live</Link>
            <Link href="/feed">Feed</Link>
            <Link href="/live">Live</Link>
            <Link href="/events">Events</Link>
            <Link href="/tournaments">Tournaments</Link>
            <Link href="/leagues">Leagues</Link>{/* <-- added */}
            <Link href="/settings">Settings</Link>
            <div className="ml-auto flex items-center gap-3">
              <HeaderAuthControls />
            </div>
          </nav>
        </header>
        <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
