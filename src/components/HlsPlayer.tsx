"use client";
import { useEffect, useRef, useState } from "react";

export default function HlsPlayer({ src, poster }: { src: string; poster?: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Type hls correctly instead of `any`
    let hls: (await import("hls.js")).default | null = null;
    setError(null);

    const setup = async () => {
      const video = videoRef.current;
      if (!video || !src) return;

      // Safari/iOS native HLS
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
        await video.play().catch(() => {});
        return;
      }

      const Hls = (await import("hls.js")).default;
      if (Hls.isSupported()) {
        hls = new Hls({ enableWorker: true });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, (_evt, data: unknown) => {
          // Narrow type just enough for fatal flag
          const d = data as { fatal?: boolean } | undefined;
          if (d?.fatal) setError("Stream error — is the HLS URL correct and live?");
        });
      } else {
        setError("Your browser doesn’t support HLS playback.");
      }
    };

    void setup();

    return () => {
      const v = videoRef.current; // copy ref into local var for cleanup
      if (hls) { try { hls.destroy(); } catch {} }
      if (v) { v.pause(); v.removeAttribute("src"); v.load(); }
    };
  }, [src]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <video ref={videoRef} controls playsInline muted poster={poster} style={{ width: "100%", borderRadius: 12 }} />
      {error && <div style={{ marginTop: 12, color: "#fca5a5" }}>{error}</div>}
    </div>
  );
}
