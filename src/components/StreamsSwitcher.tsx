"use client";

import { useMemo, useState } from "react";
import LivePlayer from "@/components/LivePlayer";
import SocialShare from "@/components/SocialShare";
import WatchInLiveButton from "@/components/WatchInLiveButton";

export type StreamRow = {
  id: string;
  title: string;
  hls_url: string;
  is_live: boolean;
};

export default function StreamsSwitcher({
  eventName,
  baseUrl,
  streams,
}: {
  eventName: string;
  baseUrl: string;
  streams: StreamRow[];
}) {
  const initial = useMemo(() => {
    if (!streams || streams.length === 0) return null;
    const live = streams.find((s) => s.is_live);
    return live ?? streams[0];
  }, [streams]);

  const [activeId, setActiveId] = useState<string | null>(initial?.id ?? null);
  const active = useMemo(
    () => streams.find((s) => s.id === activeId) ?? initial ?? null,
    [streams, activeId, initial]
  );

  if (!streams || streams.length === 0) {
    return (
      <div className="rounded-xl border p-4">
        <p className="text-sm text-gray-600">No streams are linked to this event yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Selector */}
      <div className="flex flex-wrap gap-2">
        {streams.map((s) => {
          const selected = s.id === active?.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveId(s.id)}
              className={
                "px-3 py-1.5 rounded-xl border text-sm " +
                (selected ? "bg-black text-white" : "bg-white")
              }
              title={s.is_live ? "Currently live" : "Offline"}
            >
              {s.title}{s.is_live ? " • Live" : ""}
            </button>
          );
        })}
      </div>

      {/* Player */}
      {active && (
        <div className="rounded-2xl border overflow-hidden">
          <LivePlayer hls={active.hls_url} title={`${eventName} — ${active.title}`} />
        </div>
      )}

      {/* Share + open in /live with this specific HLS */}
      {active && (
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border p-4">
            <h3 className="font-semibold mb-2">Share this stream</h3>
            <SocialShare
              url={`${baseUrl}/live?hls=${encodeURIComponent(active.hls_url)}`}
              title={`Watch ${eventName} — ${active.title}`}
              text={`Live now: ${eventName} — ${active.title} on PoolHub`}
            />
            <p className="text-xs text-gray-500 mt-2">
              Tip: /live supports <code>?hls=</code> for this exact stream.
            </p>
          </div>

          <div className="rounded-2xl border p-4">
            <h3 className="font-semibold mb-2">Watch externally</h3>
            <WatchInLiveButton hls={active.hls_url} />
            <p className="text-xs text-gray-500 mt-2 break-all">HLS: {active.hls_url}</p>
          </div>
        </div>
      )}
    </div>
  );
}
