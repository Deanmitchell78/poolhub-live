import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ProfileRow = {
  id: string;
  full_name: string | null;
  handle: string | null;
  avatar_url: string | null;
  about_me?: string | null;
};

export async function GET() {
  try {
    const supabase = await supabaseServer(); // ✅ MUST await
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr) {
      return NextResponse.json(
        { ok: false, stage: "getUser", error: userErr.message },
        { status: 500 }
      );
    }
    const user = userData?.user ?? null;
    if (!user) {
      return NextResponse.json(
        { ok: false, stage: "auth", error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, handle, avatar_url, about_me")
      .eq("id", user.id)
      .maybeSingle<ProfileRow>();

    if (error) {
      return NextResponse.json(
        { ok: false, stage: "select", error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, profile: data ?? null });
  } catch (e) {
    return NextResponse.json(
      { ok: false, stage: "catch", error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as Partial<ProfileRow>;
    const supabase = await supabaseServer(); // ✅ MUST await
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr) {
      return NextResponse.json(
        { ok: false, stage: "getUser", error: userErr.message },
        { status: 500 }
      );
    }
    const user = userData?.user ?? null;
    if (!user) {
      return NextResponse.json(
        { ok: false, stage: "auth", error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only allow updating a safe subset
    const patch: Partial<ProfileRow> = {
      full_name: body.full_name ?? undefined,
      handle: body.handle ?? undefined,
      avatar_url: body.avatar_url ?? undefined,
      about_me: body.about_me ?? undefined,
    };

    const { data, error } = await supabase
      .from("profiles")
      .update(patch)
      .eq("id", user.id)
      .select("id, full_name, handle, avatar_url, about_me")
      .maybeSingle<ProfileRow>();

    if (error) {
      return NextResponse.json(
        { ok: false, stage: "update", error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, profile: data ?? null });
  } catch (e) {
    return NextResponse.json(
      { ok: false, stage: "catch", error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
