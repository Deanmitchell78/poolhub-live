"use server";
import { supabase } from "@/lib/supabase";

export async function getStreamByEvent(eventId: string) {
  const { data, error } = await supabase
    .from("streams")
    .select("*")
    .eq("event_id", eventId)
    .single();

  // PGRST116 = no rows
  if (error && (error as any).code !== "PGRST116") throw new Error(error.message);
  return data ?? null;
}

export async function upsertStream(input: {
  eventId: string;
  title?: string;
  playbackUrl?: string;
  rtmpUrl?: string;
  streamKey?: string;
  status?: "idle" | "live" | "ended" | "error";
}) {
  const payload = {
    event_id: input.eventId,
    title: input.title ?? "PoolHub Stream", // ensure NOT NULL
    playback_url: input.playbackUrl ?? null,
    rtmp_url: input.rtmpUrl ?? null,
    stream_key: input.streamKey ?? null,
    status: input.status ?? "idle",
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("streams")
    .upsert(payload, { onConflict: "event_id" })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
}
