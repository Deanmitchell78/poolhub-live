import { supabase } from "@/lib/supabase";
import HlsPlayer from "../../../components/HlsPlayer";

export const dynamic = "force-dynamic";

export default async function EventPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params; // ✅ Await params here

  const { data, error } = await supabase
    .from("events")
    .select("id,title,starts_at,streams(status,playback_url)")
    .eq("id", id)
    .single();

  if (error || !data) {
    return (
      <main className="p-6 text-center text-red-400">
        Error loading event: {error?.message || "Not found"}
      </main>
    );
  }

  const s = Array.isArray(data.streams) ? data.streams[0] : null;
  const hls = s?.playback_url ?? "";
  const isLive = s?.status === "live";

  return (
    <main className="min-h-dvh p-6 flex flex-col items-center gap-4">
      <h1 className="text-2xl font-bold">{data.title}</h1>
      <div className="text-sm opacity-70">
        {new Date(data.starts_at).toLocaleString()}
      </div>
      {hls ? (
        <>
          <HlsPlayer src={hls} />
          <p className={`text-sm ${isLive ? "text-green-400" : "opacity-70"}`}>
            {isLive ? "LIVE" : "Stream offline or waiting to start"}
          </p>
        </>
      ) : (
        <p className="text-gray-400">No playback URL found for this event.</p>
      )}
    </main>
  );
}
