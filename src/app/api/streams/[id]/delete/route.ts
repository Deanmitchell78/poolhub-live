import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;

  const supabase = await supabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  if (!user) return NextResponse.redirect(new URL("/sign-in", base));

  // RLS should ensure only the event owner can delete
  const { error } = await supabase.from("streams").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }

  // Prefer returning to the edit page; the browser referrer will usually handle it.
  return NextResponse.redirect(new URL("/events", base));
}

export {};
