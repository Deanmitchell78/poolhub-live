import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

// wrap the app with the NextAuth SessionProvider
import Providers from "./providers";
// header auth button
import AuthButtons from "@/components/AuthButtons";

export const metadata: Metadata = {
  title: "PoolHub.Live",
  description: "Profiles, live streams, and events for pool players.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-black">
        <Providers>
          <header className="border-b">
            <div className="mx-auto max-w-5xl p-4 flex items-center justify-between gap-4">
              <Link href="/" className="font-bold text-xl">PoolHub.Live</Link>
              <nav className="flex gap-4 text-sm items-center">
                <Link href="/feed">Feed</Link>
                <Link href="/live">Live</Link>
                <Link href="/events">Events</Link>
                <Link href="/settings">Settings</Link>
              </nav>
              <AuthButtons />
            </div>
          </header>
          <main className="mx-auto max-w-5xl p-6">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
