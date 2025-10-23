"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase-browser";

type LeagueRow = {
  id: string;
  name: string | null;
  city: string | null;
  state: string | null;
  slug: string | null;
  createdAt: string | null; // alias from created_at
};

export default function LeaguesPage() {
  const [leagues, setLeagues] = useState<LeagueRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Use getSession() for instant, local auth read; no network race
  const loadSession = useCallback(async () => {
    const supabase = supabaseBrowser();
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.warn("getSession failed:", error.message);
      setUserId(null);
      return;
    }
    setUserId(data.session?.user?.id ?? null);
  }, []);

  const loadLeagues = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const supabase = supabaseBrowser();
      const { data, error } = await supabase
        .from("leagues")
        .select("id, name, city, state, slug, createdAt:created_at")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      setLeagues((data as any) ?? []);
    } catch (e: any) {
      setErr(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSession();
    loadLeagues();

    // Keep UI in sync if auth state changes (login/logout)
    const supabase = supabaseBrowser();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => {
      sub.subscription.unsubscribe();
    };
  }, [loadSession, loadLeagues]);

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Leagues</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={loadLeagues}
            className="rounded-2xl border px-3 py-1.5 text-sm"
          >
            Refresh
          </button>
          {userId ? (
            <Link className="underline text-sm" href="/leagues/new">
              Create league
            </Link>
          ) : (
            <Link className="underline text-sm" href="/(auth)/sign-in">
              Sign in to create
            </Link>
          )}
        </div>
      </header>

      {err ? (
        <div className="rounded-xl p-4 bg-red-50 border border-red-200">
          <p className="font-semibold">Couldn’t load leagues</p>
          <p className="text-sm text-red-700 break-all">{err}</p>
        </div>
      ) : null}

      {loading ? (
        <p>Loading…</p>
      ) : leagues.length === 0 ? (
        <p className="text-gray-500">No leagues yet.</p>
      ) : (
        <ul className="divide-y rounded-2xl border">
          {leagues.map((lg) => (
            <li key={lg.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:gap-4">
              <div className="sm:w-56 text-sm text-gray-600">
                {lg.createdAt ? new Date(lg.createdAt).toLocaleString() : "—"}
              </div>
              <div className="flex-1">
                <div className="font-semibold">
                  {lg.slug ? (
                    <Link className="underline" href={`/leagues/${lg.slug}`}>
                      {lg.name || "(untitled league)"}
                    </Link>
                  ) : (
                    lg.name || "(untitled league)"
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  {[lg.city, lg.state].filter(Boolean).join(", ") || "—"}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
