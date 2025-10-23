import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

/** Convert <input type="datetime-local"> -> ISO (UTC) */
function localToIso(datetimeLocal: string | null): string | null {
  if (!datetimeLocal) return null;
  const dt = new Date(datetimeLocal);
  return isNaN(dt.getTime()) ? null : dt.toISOString();
}

export async function POST(req: NextRequest) {
  const supabase = await supabaseServer();

  // Require auth (remove if you want public event creation)
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  if (!user) {
    return NextResponse.redirect(new URL("/sign-in", base));
  }

  const form = await req.formData();

  const title = (form.get("title")?.toString() || "").trim();
  const starts_at_local = form.get("starts_at")?.toString() || null;
  const venue_name = (form.get("venue_name")?.toString() || "").trim() || null;
  const table_label = (form.get("table_label")?.toString() || "").trim() || null;
  const event_type_raw = (form.get("event_type")?.toString() || "").trim() || null;

  const starts_at = localToIso(starts_at_local);
  const event_type =
    event_type_raw && ["tournament", "action", "ring", "league", "exhibition"].includes(event_type_raw)
      ? event_type_raw
      : null;

  if (!title || !starts_at) {
    return NextResponse.json(
      { ok: false, error: "Title and start time are required." },
      { status: 400 }
    );
  }

  // Insert the known columns
  const { data, error } = await supabase
    .from("events")
    .insert({ title, starts_at, venue_name, table_label, event_type })
    .select("id")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Failed to create event." },
      { status: 400 }
    );
  }

  return NextResponse.redirect(new URL(`/events/${data.id}`, base));
}

export {};
