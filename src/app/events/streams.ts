"use server";
import { supabase } from "@/lib/supabase";
import type { PostgrestError } from "@supabase/supabase-js";

// ---- Types ----
export type Status = "idle" | "live" | "ended" | "error";

export type StreamRow = {
  event_id: string;
  title: string | null;
  playback_url: string | null;
  rtmp_url: string | null;
  stream_key: string | null;
  status: Status | null;
  updated_at: string | null;
};

export type UpsertInput = {
  eventId: string;
  title?: string;
  playbackUrl?: string;
  rtmpUrl?: string;
  streamKey?: string;
  status?: Status;
};

// Get one stream row for an event (or null if none)
export async function getStreamByEvent(eventId: string): Promise<StreamRow | null> {
  const { data, error } = await supabase
    .from("streams")
    .select("*")
    .eq("event_id", eventId)
    .single();

  // PGRST116 = no rows (treat as null, not an error)
  if (error && (error as PostgrestError).code !== "PGRST116") {
    throw new Error(error.message);
  }
  return (data as StreamRow | null) ?? null;
}

// Upsert a stream row keyed by event_id
export async function upsertStream(input: UpsertInput): Promise<StreamRow> {
  const payload: StreamRow = {
    event_id: input.eventId,
    title: input.title ?? "PoolHub Stream",
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
  return data as StreamRow;
}
