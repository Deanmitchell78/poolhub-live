import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const CF_ACCOUNT = process.env.CLOUDFLARE_ACCOUNT_ID ?? "";
const CF_TOKEN = process.env.CLOUDFLARE_API_TOKEN ?? "";
const CF_API = CF_ACCOUNT
  ? `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT}/stream/live_inputs`
  : null;

type Body = {
  eventId: string;
  label?: string;
};

type CFResp = {
  result?: {
    rtmp?: { url?: string | null; streamKey?: string | null } | null;
    playback?: { hls?: string | null } | null;
    webRtc?: { playback?: { hls?: string | null } | null } | null;
  };
  errors?: Array<{ message?: string }>;
};

type StreamRow = {
  playback_url: string | null;
  status: "idle" | "live" | "ended" | "error" | null;
};

export async function POST(req: NextRequest) {
  try {
    const parsed = (await req.json()) as Partial<Body>;
    const eventId = parsed.eventId;
    const label = parsed.label;

    if (!eventId) {
      return NextResponse.json({ error: "eventId required" }, { status: 400 });
    }
    if (!CF_API || !CF_TOKEN) {
      return NextResponse.json({ error: "Cloudflare env vars missing" }, { status: 500 });
    }

    // 1) Create a Live Input on Cloudflare Stream
    const cfResp = await fetch(CF_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        meta: { name: label || `poolhub-${eventId}` },
        recording: { mode: "automatic" }, // auto VOD
      }),
    });

    const cfJson = (await cfResp.json()) as CFResp;
    if (!cfResp.ok) {
      const msg = cfJson?.errors?.[0]?.message || "Cloudflare error";
      return NextResponse.json({ error: msg, details: cfJson }, { status: 500 });
    }

    const liveInput = cfJson.result;
    const rtmpUrl = liveInput?.rtmp?.url ?? null;
    const streamKey = liveInput?.rtmp?.streamKey ?? null;
    const playbackUrl =
      liveInput?.playback?.hls ??
      liveInput?.webRtc?.playback?.hls ??
      null;

    // 2) Upsert into streams table
    const { data, error } = await supabase
      .from("streams")
      .upsert(
        {
          event_id: eventId,
          title: label || "PoolHub Stream",
          rtmp_url: rtmpUrl,
          stream_key: streamKey,
          playback_url: playbackUrl,
          status: "idle",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "event_id" },
      )
      .select("playback_url,status")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const row = (data ?? {}) as StreamRow;

    return NextResponse.json({
      ok: true,
      stream: {
        eventId,
        rtmpUrl,
        streamKey,
        playbackUrl: row.playback_url ?? null,
        status: row.status ?? "idle",
      },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
