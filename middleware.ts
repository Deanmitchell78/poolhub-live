// middleware.ts (at project root)
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const host = req.headers.get("host");
  // Redirect only in production when visiting the www host
  if (host === "www.poolhub.live") {
    const url = new URL(req.nextUrl);
    url.host = "poolhub.live";
    url.protocol = "https:";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/:path*", // run on all paths
};
