export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import Link from "next/link";
import SocialShare from "@/components/SocialShare";
import LivePlayer from "@/components/LivePlayer";

export default async function LivePage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const shareUrl = `${base}/live`;

  // Allow override: /live?hls=...
  const sp = searchParams || {};
  const override = typeof sp.hls === "string" ? sp.hls : Array.isArray(sp.hls) ? sp.hls[0] : "";
  const envHls = process.env.NEXT_PUBLIC_LIVE_HLS_URL || "";
  const hls = override || envHls;

  const isDev = process.env.NODE_ENV !== "production";

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Live</h1>
          <p className="text-sm text-gray-600">
            Watch live streams and share this page with your friends.
          </p>
        </div>
        <Link href="/events" className="text-sm underline">
          Browse events â†’
        </Link>
      </header>

      {isDev && (
        <div className="rounded-xl border p-3 text-sm">
          <div className="font-semibold mb-1">DEV debug</div>
          <div className="text-gray-700 space-y-1">
            <div>
              <span className="text-gray-500">NODE_ENV:</span> {process.env.NODE_ENV}
            </div>
            <div className="break-all">
              <span className="text-gray-500">Override ?hls=</span>{" "}
              {override ? override : <span className="text-gray-500">[none]</span>}
            </div>
            <div className="break-all">
              <span className="text-gray-500">Env HLS:</span>{" "}
              {envHls ? envHls : <span className="text-red-600">[EMPTY]</span>}
            </div>
            <div className="break-all">
              <span className="text-gray-500">Using HLS:</span>{" "}
              {hls ? hls : <span className="text-red-600">[EMPTY]</span>}
            </div>
            {hls && (
              <div className="mt-1">
                <a className="underline" href={hls} target="_blank">
                  Open manifest.m3u8 in a new tab
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      <section className="rounded-2xl border overflow-hidden">
        <LivePlayer hls={hls} title="PoolHub Live Stream" />
      </section>

      <SocialShare
        url={shareUrl}
        title="Watch live on PoolHub"
        text="Iâ€™m live on PoolHub â€” come watch!"
      />

      <footer className="pt-2">
        <Link href="/" className="underline text-sm">â† Home</Link>
      </footer>
    </main>
  );
}
