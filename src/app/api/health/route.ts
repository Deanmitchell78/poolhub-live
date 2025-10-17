import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export async function GET() {
  try {
    const info = {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseAnon: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasCfAccount: !!process.env.CLOUDFLARE_ACCOUNT_ID,
      hasCfToken: !!process.env.CLOUDFLARE_API_TOKEN,
    };

    // Try to instantiate Supabase lazily (throws if envs missing at runtime)
    let supabaseOk = false;
    try {
      const { supabase } = await import("@/lib/supabase");
      // @ts-ignore - we only check that the client shape exists
      supabaseOk = typeof supabase.from === "function";
    } catch (e) {
      return NextResponse.json(
        { ok: false, ...info, supabaseOk, error: String((e as Error).message) },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, ...info, supabaseOk });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String((e as Error).message) }, { status: 500 });
  }
}
