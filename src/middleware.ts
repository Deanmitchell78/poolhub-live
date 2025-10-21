import { NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { NextRequest } from "next/server";

/**
 * Protects all pages except public ones by checking the Supabase session cookie.
 */
export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });

  // create Supabase server client bound to cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
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

  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  // public paths that don't require auth
  const publicPaths = ["/", "/sign-in", "/callback", "/api"];
  const isPublic = publicPaths.some((p) => request.nextUrl.pathname.startsWith(p));

  // redirect unauthenticated users trying to access protected paths
  if (!user && !isPublic) {
    const redirectUrl = new URL("/sign-in", request.url);
    redirectUrl.searchParams.set("from", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

// tell Next which paths to run middleware on
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
