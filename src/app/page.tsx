export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { supabaseServer } from "@/lib/supabase-server";

/** Minimal shape we actually render */
type EventRow = {
  id: string;
  title?: string | null;
  name?: string | null;
  startsAt?: string | null; // aliased from starts_at
  venue_name?: string | null;
  city?: string | null;
  state?: string | null;
  slug?: string | null;
};

function fmtWhen(iso: string | null): string {
  if (!iso) return "TBD";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "TBD" : d.toLocaleString();
}

export default async function Home() {
  // ⬇️ MUST await: supabaseServer() is async on Next 15
  const supabase = await supabaseServer();

  // 1) Check auth on the server via cookies. If no user → don't query events.
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user ?? null;

  let eventsErr: string | null = null;
  let list: Array<{ id: string; slug?: string | null; title: string; when: string; venue: string | null }> = [];

  if (user) {
    // 2) Only signed-in users query upcoming events
    const { data: upcomingRaw, error } = await supabase
      .from("events")
      // alias snake_case -> camelCase to keep TS clean
      .select("id, title, name, startsAt:starts_at, venue_name, city, state, slug")
      .gte("starts_at", new Date().toISOString())
      .order("starts_at", { ascending: true })
      .limit(10);

    if (error) {
      eventsErr = error.message;
    } else {
      const upcoming = (Array.isArray(upcomingRaw) ? upcomingRaw : []) as EventRow[];
      list = upcoming.map((e) => {
        const title = e.title ?? e.name ?? "Event";
        const when = fmtWhen(e.startsAt ?? null);
        const venue =
          e.venue_name ??
          (e.city ? `${e.city}${e.state ? ", " + e.state : ""}` : null);
        return { id: e.id, slug: e.slug, title, when, venue };
      });
    }
  }

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-10">
      <section className="rounded-2xl p-6 bg-gradient-to-r from-sky-500/20 via-fuchsia-500/20 to-violet-500/20 border shadow-sm">
        <h1 className="text-2xl font-bold">PoolHub Live</h1>
        <p className="text-gray-700">
          Welcome. Use the navigation to browse Live streams, Events, Tournaments, and more.
        </p>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Upcoming Events</h2>
          <a
            href="/events"
            className="text-sm rounded-2xl px-3 py-1 border shadow bg-white"
          >
            View all
          </a>
        </div>

        {/* Not signed in → friendly prompt and NO DB query */}
        {!user ? (
          <p className="text-gray-600">Please sign in to see upcoming events.</p>
        ) : (
          <>
            {eventsErr && (
              <p className="text-sm text-red-600">
                Failed to load events: {eventsErr}
              </p>
            )}

            {list.length === 0 ? (
              <p className="text-gray-600">No upcoming events.</p>
            ) : (
              <ul className="divide-y rounded-2xl border shadow-sm bg-white">
                {list.map((e) => (
                  <li key={e.id} className="p-4 flex items-center justify-between">
                    <div>
                      <div className="font-medium">{e.title}</div>
                      <div className="text-sm text-gray-600">
                        {e.when}
                        {e.venue ? ` • ${e.venue}` : ""}
                      </div>
                    </div>
                    <a
                      href={e.slug ? `/events/${e.slug}` : `/events/${e.id}`}
                      className="text-sm rounded-2xl px-3 py-1 border shadow bg-white"
                    >
                      Open
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>
    </main>
  );
}
