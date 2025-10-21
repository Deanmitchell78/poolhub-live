import { NextResponse } from "next/server";
import { supabaseServer } from "../../../lib/supabase-server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = supabaseServer();
  const { data, error } = await supabase.auth.getUser();
  return NextResponse.json({
    ok: !error && !!data?.user,
    user: data?.user ?? null,
    error: error?.message ?? null,
  });
}
