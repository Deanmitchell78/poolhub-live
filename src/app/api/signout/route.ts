import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseServer } from "@/lib/supabase-server";

// Names we may want to clear; adjust if you use different ones.
const AUTH_COOKIE_NAMES = [
  "sb:token",
  "sb:refresh-token",
  "supabase-auth-token",
  "next-auth.session-token",
  "next-auth.csrf-token",
];

async function doSignOutRedirect(to: string) {
  const res = NextResponse.redirect(new URL(to, process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"));

  // In Next 15 route handlers, cookies() is async
  const jar = await cookies();

  // Clear known auth cookies defensively
  for (const name of AUTH_COOKIE_NAMES) {
    // Not all cookies will exist; this is safe
    res.cookies.set({
      name,
      value: "",
      path: "/",
      maxAge: 0,
    });
  }

  return res;
}

export async function POST(_req: NextRequest) {
  const supabase = await supabaseServer();
  // Best-effort server-side signout (RLS will still protect)
  await supabase.auth.signOut().catch(() => {});

  return doSignOutRedirect("/");
}

// Optional GET handler so links to /api/signout also work
export async function GET(_req: NextRequest) {
  const supabase = await supabaseServer();
  await supabase.auth.signOut().catch(() => {});
  return doSignOutRedirect("/");
}

// Ensure this file is treated as a module even if tree-shaken
export {};
