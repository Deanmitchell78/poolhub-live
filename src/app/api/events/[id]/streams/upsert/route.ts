import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await ctx.params;

  const supabase = await supabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  if (!user) return NextResponse.redirect(new URL("/sign-in", base));

  const form = await req.formData();

  const streamId = form.get("stream_id")?.toString() || null;
  const title = (form.get("title")?.toString() || "").trim() || "Table";
  const hls_url = (form.get("hls_url")?.toString() || "").trim();
  const is_live = (form.get("is_live")?.toString() || "") === "on";
  const order_index = Number(form.get("order_index")?.toString() || "0");

  if (!hls_url) {
    return NextResponse.json({ ok: false, error: "HLS URL is required" }, { status: 400 });
  }

  // (Optional) verify event exists (RLS will still enforce ownership)
  const { data: ev, error: evErr } = await supabase
    .from("events")
    .select("id, owner_id")
    .eq("id", eventId)
    .single();

  if (evErr || !ev) {
    return NextResponse.json({ ok: false, error: "Event not found" }, { status: 404 });
  }

  // Upsert logic: update if streamId provided, else insert
  if (streamId) {
    const { error: updErr } = await supabase
      .from("streams")
      .update({ title, hls_url, is_live, order_index })
      .eq("id", streamId)
      .eq("event_id", eventId);

    if (updErr) {
      return NextResponse.json({ ok: false, error: updErr.message }, { status: 400 });
    }
  } else {
    const { error: insErr } = await supabase
      .from("streams")
      .insert({ event_id: eventId, title, hls_url, is_live, order_index });

    if (insErr) {
      return NextResponse.json({ ok: false, error: insErr.message }, { status: 400 });
    }
  }

  return NextResponse.redirect(new URL(`/events/${eventId}/edit?updated=1`, base));
}

export {};
