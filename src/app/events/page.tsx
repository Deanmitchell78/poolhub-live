import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// 🔧 Types to avoid `any`
type StreamRow = { status: string | null; playback_url: string | null };
type EventRow = {
  id: string;
  title: string;
  starts_at: string;
  streams: StreamRow[] | null;
};

export default async function EventsList() {
  async function createTestEvent() {
    "use server";
    const title = `Test Event ${new Date().toLocaleString()}`;
    const { data, error } = await supabase
      .from("events")
      .insert({ title, starts_at: new Date().toISOString() })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return data?.id as string;
  }

  const { data, error } = await supabase
    .from("events")
    .select("id,title,starts_at,streams(status,playback_url)")
    .order("starts_at", { ascending: false });

  if (error) {
    return <main className="max-w-3xl mx-auto p-6">Error loading events: {error.message}</main>;
  }

  const rows: EventRow[] = (data ?? []) as unknown as EventRow[];

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Events</h1>
        <div className="flex gap-2">
          <form action={createTestEvent}>
            <button className="bg-white/10 px-3 py-2 rounded text-sm">Create Test Event</button>
          </form>
          <Link href="/quickstream" className="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700">
            + Quick Stream
          </Link>
        </div>
      </div>

      <ul className="space-y-2">
        {rows.map((e) => {
          const s = Array.isArray(e.streams) ? e.streams[0] : null;
          const live = s?.status === "live" && !!s?.playback_url;
          return (
            <li key={e.id} className="bg-white/5 p-3 rounded flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <Link href={`/events/${e.id}`} className="font-semibold underline">
                    {e.title}
                  </Link>
                  <Link href={`/events/${e.id}/manage`} className="text-sm bg-white/10 px-2 py-1 rounded underline">
                    Manage
                  </Link>
                </div>
                <div className="text-sm opacity-70">{new Date(e.starts_at).toLocaleString()}</div>
              </div>
              <div className={`text-sm ${live ? "text-green-400" : "opacity-70"}`}>{live ? "LIVE" : "No stream"}</div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
