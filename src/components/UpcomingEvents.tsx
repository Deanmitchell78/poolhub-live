"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase-browser";

type EventRow = {
  id: string;
  title: string | null;
  startsAt: string | null; // alias from starts_at
  city: string | null;
  state: string | null;
  slug?: string | null;
};

export default function UpcomingEvents({ limit = 5 }: { limit?: number }) {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Read local auth immediately; avoid DB calls when logged out
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

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const supabase = supabaseBrowser();
      // ⚠️ Use snake_case column and alias to camelCase
      const { data, error } = await supabase
        .from("events")
        .select("id, title, startsAt:starts_at, city, state, slug")
        .gte("starts_at", new Date().toISOString())
        .order("starts_at", { ascending: true })
        .limit(limit);
      if (error) throw error;
      setEvents((data as any) ?? []);
    } catch (e: any) {
      setErr(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  useEffect(() => {
    // Only load events when signed in
    if (userId) {
      loadEvents();
    } else {
      setLoading(false);
      setEvents([]);
      setErr(null);
    }

    // Keep widget in sync on auth changes
    const supabase = supabaseBrowser();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const uid = session?.user?.id ?? null;
      setUserId(uid);
      if (uid) loadEvents();
      else {
        setEvents([]);
        setErr(null);
      }
    });
    return () => {
      sub.subscription.unsubscribe();
    };
  }, [userId, loadEvents]);

  return (
    <section className="rounded-2xl border p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Upcoming Events</h2>
        <Link className="underline text-sm" href="/events">
          View all
        </Link>
      </div>

      {/* Logged out view */}
      {!userId ? (
        <p className="text-gray-600">
          Please sign in to see upcoming events.
        </p>
      ) : loading ? (
        <p>Loading…</p>
      ) : err ? (
        <div className="rounded-xl p-3 bg-red-50 border border-red-200 text-red-700 text-sm">
          Failed to load events: {err}
        </div>
      ) : events.length === 0 ? (
        <p className="text-gray-600">No upcoming events.</p>
      ) : (
        <ul className="divide-y">
          {events.map((ev) => (
            <li key={ev.id} className="py-2 flex items-center gap-3">
              <div className="w-44 shrink-0 text-sm text-gray-600">
                {ev.startsAt ? new Date(ev.startsAt).toLocaleString() : "—"}
              </div>
              <div className="min-w-0">
                <div className="font-medium truncate">
                  {ev.slug ? (
                    <Link href={`/events/${ev.slug}`} className="underline">
                      {ev.title || "(untitled)"}
                    </Link>
                  ) : (
                    ev.title || "(untitled)"
                  )}
                </div>
                <div className="text-sm text-gray-600 truncate">
                  {[ev.city, ev.state].filter(Boolean).join(", ") || "—"}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
