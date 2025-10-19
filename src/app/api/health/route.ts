// src/app/api/health/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
    const cfAccount = process.env.CLOUDFLARE_ACCOUNT_ID ?? "";
    const cfToken = process.env.CLOUDFLARE_API_TOKEN ?? "";

    const info = {
      hasSupabaseUrl: !!url,
      hasSupabaseAnon: !!anon,
      hasCfAccount: !!cfAccount,
      hasCfToken: !!cfToken,
      anonLength: anon.length, // safe: length only
      urlLooksRight: url.startsWith("https://") && url.includes(".supabase.co"),
      nodeEnv: process.env.NODE_ENV,
    };

    // Build a server-safe Supabase client (no window/localStorage)
    let supabaseOk = false;
    try {
      const supabase = createClient(url, anon, { auth: { persistSession: false } });
      // Light touch: just assert the shape (no network call)
      supabaseOk = typeof supabase.from === "function";
    } catch (e) {
      return NextResponse.json({ ok: false, ...info, supabaseOk, error: String((e as Error).message) }, { status: 500 });
    }

    return NextResponse.json({ ok: info.hasSupabaseUrl && info.hasSupabaseAnon, ...info, supabaseOk }, {
      headers: { "Cache-Control": "no-store" }
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String((e as Error).message) }, { status: 500 });
  }
}
