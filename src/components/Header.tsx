"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Header() {
  const [userId, setUserId] = useState<string | null>(null);
  const [handle, setHandle] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!mounted) return;
      setUserId(user?.id ?? null);
      if (user?.id) {
        const { data } = await supabase
          .from("profiles")
          .select("handle")
          .eq("id", user.id)
          .maybeSingle();
        setHandle(data?.handle ?? null);
      }
    })();
    return () => { mounted = false; };
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <header className="w-full border-b bg-white">
      <nav className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-semibold">PoolHub Live</Link>
          <Link href="/feed">Feed</Link>
          <Link href="/live">Live</Link>
          <Link href="/events">Events</Link>
          <Link href="/tournaments">Tournaments</Link>
          <Link href="/leagues">Leagues</Link>
        </div>
        <div className="flex items-center gap-3">
          {!userId ? (
            <Link href="/sign-in" className="underline">Sign in</Link>
          ) : (
            <>
              {handle ? (
                <Link href={`/profile/${handle.toLowerCase()}`} className="underline">@{handle}</Link>
              ) : (
                <Link href="/onboarding" className="underline">Finish profile</Link>
              )}
              <button onClick={signOut} className="rounded-2xl px-3 py-1 border shadow">
                Sign out
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
