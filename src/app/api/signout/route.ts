export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { cookies as nextCookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function POST(request: Request) {
  // We'll return JSON; most important is that we attach cookie changes to this response.
  const response = NextResponse.json({ ok: true });

  // Read cookies from the incoming request
  const reqCookies = nextCookies();

  // Create a Supabase server client that READS from request and WRITES to response
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return reqCookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set(name, value, options);
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set(name, "", { ...options, maxAge: 0 });
        },
      },
    }
  );

  try {
    await supabase.auth.signOut();
  } catch {
    // ignore; response will still clear cookies
  }

  return response;
}
