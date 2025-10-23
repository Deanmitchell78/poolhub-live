"use client";

import Link from "next/link";

export default function WatchInLiveButton({ hls }: { hls: string }) {
  const encoded = encodeURIComponent(hls || "");
  return (
    <Link
      href={`/live?hls=${encoded}`}
      className="px-3 py-2 rounded-xl bg-black text-white text-sm inline-block"
      prefetch={false}
      title="Open this stream in the Live page"
    >
      Watch in /live
    </Link>
  );
}
