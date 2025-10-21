export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase-server";
import StreamsAdmin, { type EditableStream } from "@/components/StreamsAdmin";

type EventRow = {
  id: string;
  name: string | null;
  owner_id: string;
  created_at: string;
};

export default async function EventEditPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = supabaseServer();

  // Must be signed in
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) redirect("/sign-in");

  // Fetch event
  const { data: event, error: eErr } = await supabase
    .from("events")
    .select("id, name, owner_id, created_at")
    .eq("id", params.id)
    .single<EventRow>();

  if (eErr || !event) return notFound();

  // Only owner can edit
  if (event.owner_id !== user.id) {
    redirect(`/events/${event.id}`);
  }

  // Fetch streams
  const { data: streamsData } = await supabase
    .from("streams")
    .select("id, title, hls_url, is_live, order_index")
    .eq("event_id", event.id)
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: false });

  const streams: EditableStream[] = (streamsData ?? []).map((s: any) => ({
    id: s.id,
    title: s.title ?? "Table",
    hls_url: s.hls_url ?? "",
    is_live: !!s.is_live,
    order_index: s.order_index ?? 0,
  }));

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Edit Event</h1>
          <p className="text-sm text-gray-500">{event.name ?? "Untitled event"}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/events/${event.id}`} className="text-sm underline">
            View event
          </Link>
          <Link href="/events" className="text-sm underline">
            All events
          </Link>
        </div>
      </header>

      <StreamsAdmin eventId={event.id} streams={streams} />
    </main>
  );
}
