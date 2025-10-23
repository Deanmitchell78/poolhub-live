export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase-server";
import StreamsSwitcher, { type StreamRow } from "@/components/StreamsSwitcher";

// Accept both legacy (camelCase) and new (snake_case) shapes
type EventRow = Partial<{
  id: string;
  title: string | null;       // new
  name: string | null;        // legacy elsewhere
  starts_at: string | null;   // new
  startsAt: string | null;    // legacy camel
  venue_name: string | null;  // new
  table_label: string | null; // new
  event_type: string | null;  // new
  city: string | null;        // legacy
  state: string | null;       // legacy
  owner_id: string;
  description: string | null;
  created_at: string;
}>;

export default async function EventPage({ params }: { params: { id: string } }) {
  const supabase = await supabaseServer();

  // Select a superset of columns so either schema works
  const { data: event, error: eErr } = await supabase
    .from("events")
    .select(
      [
        "id",
        "title",
        "name",
        "starts_at",
        "startsAt",
        "venue_name",
        "table_label",
        "event_type",
        "city",
        "state",
        "owner_id",
        "description",
        "created_at",
      ].join(", ")
    )
    .eq("id", params.id)
    .maybeSingle<EventRow>();

  if (eErr || !event) return notFound();

  // Normalize fields
  const title = event.title ?? event.name ?? "Event";
  const startsISO = event.starts_at ?? event.startsAt ?? null;
  const when = startsISO ? new Date(startsISO).toLocaleString() : "TBD";

  const venue = event.venue_name
    ?? (event.city ? (event.state ? `${event.city}, ${event.state}` : event.city) : null);

  // Load streams for this event (if any)
  const { data: streamsData } = await supabase
    .from("streams")
    .select("id, title, hls_url, is_live, order_index, created_at")
    .eq("event_id", event.id)
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: false });

  const streams: StreamRow[] = (streamsData ?? []).map((s: any) => ({
    id: s.id,
    title: s.title ?? "Table",
    hls_url: s.hls_url ?? "",
    is_live: !!s.is_live,
  }));

  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-sm text-gray-500">
            {when}
            {venue ? ` • ${venue}` : ""}
            {event.table_label ? ` • ${event.table_label}` : ""}
            {event.event_type ? ` • ${event.event_type}` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/events" className="text-sm underline">
            All events
          </Link>
          <Link href={`/events/${event.id}/edit`} className="text-sm underline">
            Edit
          </Link>
        </div>
      </header>

      {streams.length > 0 ? (
        <StreamsSwitcher
          eventName={title}
          baseUrl={base}
          streams={streams}
        />
      ) : (
        <div className="rounded-xl border p-4">
          <p className="text-sm text-gray-700">No streams are attached to this event yet.</p>
          <p className="text-xs text-gray-500 mt-2">
            Add streams on the Edit page. Paste each table’s HLS <code>.m3u8</code>, set a title,
            and mark which are live.
          </p>
        </div>
      )}

      {event.description && (
        <section className="prose max-w-none">
          <h2 className="text-lg font-semibold mt-8">About</h2>
          <p className="text-gray-800">{event.description}</p>
        </section>
      )}
    </main>
  );
}
