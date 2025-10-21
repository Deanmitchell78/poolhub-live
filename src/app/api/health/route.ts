import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  const hasSupabaseUrl = Boolean(url);
  const hasSupabaseAnon = Boolean(anon);

  let supabaseOk = false;
  let error: string | null = null;

  if (hasSupabaseUrl && hasSupabaseAnon) {
    try {
      const supabase = createClient(url, anon);
      // simple call that doesn't require auth: get auth settings
      const { data, error: err } = await supabase.auth.getSession();
      // getSession may be null when not logged in, but shouldn't throw
      supabaseOk = !err;
      if (err) error = err.message;
    } catch (e: any) {
      error = e?.message ?? "Unknown error creating Supabase client";
    }
  } else {
    error = "Supabase env vars missing: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.";
  }

  return NextResponse.json({
    ok: hasSupabaseUrl && hasSupabaseAnon && supabaseOk,
    hasSupabaseUrl,
    hasSupabaseAnon,
    supabaseOk,
    error,
  });
}
