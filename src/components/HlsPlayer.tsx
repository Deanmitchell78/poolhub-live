"use client";
import { useEffect, useRef, useState } from "react";

export default function HlsPlayer({ src, poster }: { src: string; poster?: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let hls: any;
    setError(null);

    const setup = async () => {
      const video = videoRef.current;
      if (!video || !src) return;

      // Safari/iOS can play HLS natively
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
        await video.play().catch(() => {});
        return;
      }

      // Other browsers: use hls.js
      const Hls = (await import("hls.js")).default;
      if (Hls.isSupported()) {
        hls = new Hls({ enableWorker: true });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, (_evt, data) => {
          if (data.fatal) setError("Stream error — is the HLS URL correct and live?");
        });
      } else {
        setError("Your browser doesn’t support HLS playback.");
      }
    };

    setup();
    return () => {
      if (hls) try { hls.destroy(); } catch {}
      const v = videoRef.current;
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
