export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { supabaseServer } from "@/lib/supabase-server";
import Link from "next/link";

type EventRow = {
  id: string;
  title: string | null;
  name: string | null;
  starts_at: string | null;
  venue_name: string | null;
};

function fmtWhen(iso: string | null) {
  if (!iso) return "TBD";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "TBD" : d.toLocaleString();
}

export default async function EventsPage() {
  const supabase = await supabaseServer();

  // Who's signed in? (for "Create event" link)
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user ?? null;

  const nowIso = new Date().toISOString();

  // ✅ Removed `slug` from the select to avoid the error
  const { data, error } = await supabase
    .from("events")
    .select("id, title, name, starts_at, venue_name")
    .gte("starts_at", nowIso)
    .order("starts_at", { ascending: true })
    .limit(100);

  const rows = (Array.isArray(data) ? data : []) as EventRow[];
  const errMsg = error?.message ?? null;

  return (
    <main className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="rounded-2xl p-6 bg-gradient-to-r from-sky-500/20 via-fuchsia-500/20 to-violet-500/20 border shadow-sm">
          <h1 className="text-2xl font-bold">Events</h1>
          <p className="text-gray-700">Browse upcoming events.</p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/events"
            className="text-sm rounded-2xl px-3 py-2 border shadow bg-white self-start"
          >
            Refresh
          </Link>
          {user ? (
            <Link
              href="/events/new"
              className="text-sm rounded-2xl px-3 py-2 border shadow bg-white self-start"
            >
              Create event
            </Link>
          ) : (
            <Link
              href="/sign-in?redirect=/events"
              className="text-sm rounded-2xl px-3 py-2 border shadow bg-white self-start"
            >
              Sign in to create
            </Link>
          )}
        </div>
      </div>

      {errMsg ? (
        <div className="rounded-xl p-4 bg-red-50 border border-red-200 text-red-700">
          Couldn’t load events<br />
          <span className="text-sm break-all">{errMsg}</span>
        </div>
      ) : rows.length === 0 ? (
        <p className="text-gray-600">No events yet.</p>
      ) : (
        <ul className="divide-y rounded-2xl border shadow-sm bg-white">
          {rows.map((e) => {
            const title = e.title ?? e.name ?? "Event";
            const when = fmtWhen(e.starts_at);
            const venue = e.venue_name ?? null;

            return (
              <li key={e.id} className="p-4 flex items-center justify-between">
                <div className="min-w-0">
                  <div className="font-medium truncate">{title}</div>
                  <div className="text-sm text-gray-600">
                    {when}
                    {venue ? ` • ${venue}` : ""}
                  </div>
                </div>
                <a
                  href={`/events/${e.id}`} // use id since slug doesn't exist
                  className="text-sm rounded-2xl px-3 py-1 border shadow bg-white"
                >
                  Open
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
