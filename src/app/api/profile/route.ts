export const dynamic = "force-dynamic";
// (The above export makes this file a module even before imports)

import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

/**
 * GET /api/profile
 * Returns the authenticated user's profile (selecting all fields we use in the UI).
 */
export async function GET() {
  const supabase = supabaseServer();
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr) return NextResponse.json({ ok: false, stage: "getUser", error: userErr.message }, { status: 500 });
  if (!user) return NextResponse.json({ ok: false, stage: "auth", error: "Unauthorized" }, { status: 401 });

  const { data: profile, error: profErr } = await supabase
    .from("profiles")
    .select("id, handle, full_name, avatar_url, league, other_league, apa_rating, napa_rating, fargo_rating, cue_play, cue_break, cue_jump, cashapp, venmo, favorite_game")
    .eq("id", user.id)
    .maybeSingle();

  return NextResponse.json({
    ok: true,
    user: { id: user.id, email: user.email },
    profile,
    dbError: profErr?.message ?? null,
  });
}

/**
 * POST /api/profile
 * Sets initial username (handle) and optional full_name during onboarding.
 */
export async function POST(req: Request) {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const handleRaw: string | undefined = body?.handle;
  const full_name: string | undefined = body?.full_name;

  if (!handleRaw) return NextResponse.json({ message: "Missing username" }, { status: 400 });

  const handle = String(handleRaw).toLowerCase();
  if (!/^[a-z0-9_.]{3,20}$/.test(handle)) {
    return NextResponse.json({ message: "Invalid username format" }, { status: 400 });
  }

  // Block reserved paths
  const reserved = new Set([
    "admin","support","api","u","me","live","events","tournaments","leagues",
    "profile","profiles","signup","login","sign-in","callback","onboarding"
  ]);
  if (reserved.has(handle)) {
    return NextResponse.json({ message: "That username is reserved" }, { status: 400 });
  }

  // Ensure profile row exists
  const { data: existing, error: getErr } = await supabase
    .from("profiles")
    .select("id, handle")
    .eq("id", user.id)
    .maybeSingle();
  if (getErr) return NextResponse.json({ message: `DB read error: ${getErr.message}` }, { status: 500 });

  if (!existing) {
    const { error } = await supabase.from("profiles").insert({ id: user.id });
    if (error) return NextResponse.json({ message: `DB insert error: ${error.message}` }, { status: 500 });
  }

  if (existing?.handle) {
    return NextResponse.json({ message: "Username already set" }, { status: 400 });
  }

  const { error: updErr } = await supabase
    .from("profiles")
    .update({ handle, full_name })
    .eq("id", user.id);

  if (updErr) {
    return NextResponse.json({ message: `DB update error: ${updErr.message}` }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

/**
 * PUT /api/profile
 * Update any subset of allowed profile fields.
 * Body can include:
 *  { full_name, league, other_league, apa_rating, napa_rating, fargo_rating,
 *    cue_play, cue_break, cue_jump, cashapp, venmo, favorite_game, avatar_url }
 */
export async function PUT(req: Request) {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));

  // Validate Fargo if present
  if (body.fargo_rating != null) {
    const n = Number(body.fargo_rating);
    if (!Number.isInteger(n) || n < 200 || n > 850) {
      return NextResponse.json({ message: "Fargo rating must be an integer between 200 and 850" }, { status: 400 });
    }
    body.fargo_rating = n;
  }

  // Whitelist fields
  const allowed = [
    "full_name","league","other_league","apa_rating","napa_rating","fargo_rating",
    "cue_play","cue_break","cue_jump","cashapp","venmo","favorite_game","avatar_url"
  ] as const;

  const update: Record<string, any> = {};
  for (const k of allowed) if (k in body) update[k] = body[k];

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ message: "No fields to update" }, { status: 400 });
  }

  const { error } = await supabase.from("profiles").update(update).eq("id", user.id);
  if (error) return NextResponse.json({ message: `DB update error: ${error.message}` }, { status: 400 });

  return NextResponse.json({ ok: true });
}
