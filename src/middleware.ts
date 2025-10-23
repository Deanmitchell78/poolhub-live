import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Rules:
 * - Anonymous users can browse public pages, but NOT /onboarding (they'll be sent to /sign-in).
 * - Logged-in users without a username are forced to /onboarding.
 * - Logged-in users with a username can go anywhere.
 */
export async function middleware(req: NextRequest) {
  const url = new URL(req.url);
  const pathname = url.pathname;

  // Always allow these paths through
  const bypassPrefixes = [
    "/(auth)",
    "/sign-in",
    "/callback",
    "/api/profile", // needed to save profile
    "/_next", "/favicon", "/images", "/public", "/assets",
  ];
  if (bypassPrefixes.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const res = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => req.cookies.get(name)?.value,
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // If NOT logged in:
  if (!user) {
    // /onboarding requires auth; send them to /sign-in
    if (pathname.startsWith("/onboarding")) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
    // Anonymous can browse other pages
    return res;
  }

  // Logged in: check if they already have a username
  const { data: profile } = await supabase
    .from("profiles")
    .select("handle")
    .eq("id", user.id)
    .maybeSingle();

  const hasUsername = !!profile?.handle;

  // If they DON'T have a username, force /onboarding
  if (!hasUsername && !pathname.startsWith("/onboarding")) {
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }

  // All good
  return res;
}

export const config = {
  matcher: ["/((?!_next|favicon\\.ico|images|public|assets).*)"],
};
