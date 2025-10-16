
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const CF_ACCOUNT = process.env.CLOUDFLARE_ACCOUNT_ID!;
const CF_TOKEN = process.env.CLOUDFLARE_API_TOKEN!;
const CF_API = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT}/stream/live_inputs`;

export async function POST(req: NextRequest) {
  try {
    const { eventId, label } = await req.json();

    if (!eventId) {
      return NextResponse.json({ error: "eventId required" }, { status: 400 });
    }
    if (!CF_ACCOUNT || !CF_TOKEN) {
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

    const cfJson = await cfResp.json();
    if (!cfResp.ok) {
      return NextResponse.json({ error: "Cloudflare error", details: cfJson }, { status: 500 });
    }

    const liveInput = cfJson.result;
    const rtmpUrl: string | undefined = liveInput?.rtmp?.url;
    const streamKey: string | undefined = liveInput?.rtmp?.streamKey;
    // Some accounts return playback at liveInput.playback.hls, others under webRtc.playback.hls
    const playbackUrl: string | undefined =
      liveInput?.playback?.hls || liveInput?.webRtc?.playback?.hls || null;

    // 2) Upsert into streams table
    const { data, error } = await supabase
      .from("streams")
      .upsert(
        {
          event_id: eventId,
          title: label || "PoolHub Stream",
          rtmp_url: rtmpUrl ?? null,
          stream_key: streamKey ?? null,
          playback_url: playbackUrl ?? null,
          status: "idle",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "event_id" },
      )
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      stream: {
        eventId,
        rtmpUrl: rtmpUrl ?? null,
        streamKey: streamKey ?? null,
        playbackUrl: data?.playback_url ?? null,
        status: data?.status ?? "idle",
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unknown error" }, { status: 500 });
  }
}
