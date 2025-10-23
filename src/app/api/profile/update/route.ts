import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  const supabase = await supabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  if (!user) {
    return NextResponse.redirect(new URL("/sign-in", base));
  }

  const form = await req.formData();
  const get = (k: string) => (form.get(k)?.toString().trim() || null);
  const parseIntOrNull = (k: string) => {
    const v = get(k);
    if (v === null || v === "") return null;
    const n = Number(v);
    return Number.isFinite(n) ? Math.trunc(n) : null;
  };

  const payload = {
    id: user.id,
    full_name: get("full_name"),
    handle: get("handle"),
    city: get("city"),
    state: get("state"),
    bio: get("bio"),
    fargo_rating: parseIntOrNull("fargo_rating"),
    apa_skill: get("apa_skill"),
    preferred_game: get("preferred_game"),
    facebook_url: get("facebook_url"),
    youtube_url: get("youtube_url"),
    twitch_url: get("twitch_url"),
    cashapp: get("cashapp"),
    pool_cue: get("pool_cue"),
    break_cue: get("break_cue"),
    jump_cue: get("jump_cue"),
    updated_at: new Date().toISOString(),
  };

  if (payload.handle && !/^[a-z0-9_\.]{3,20}$/.test(payload.handle)) {
    return NextResponse.json(
      { ok: false, error: "Handle must be 3â€“20 chars: letters, numbers, underscore, dot." },
      { status: 400 }
    );
    }

  const { error } = await supabase.from("profiles").upsert(payload, { onConflict: "id" });
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }

  return NextResponse.redirect(new URL("/me?updated=1", base));
}

// Ensure module context even if tree-shaken
export {};
