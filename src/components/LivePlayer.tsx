"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Hls from "hls.js";

type Status = "checking" | "live" | "offline" | "error";

export default function LivePlayer({
  hls,
  title = "PoolHub Live",
  checkIntervalMs = 15000,
}: {
  hls: string;
  title?: string;
  checkIntervalMs?: number;
}) {
  const [status, setStatus] = useState<Status>("checking");
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [lastErr, setLastErr] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const badge = useMemo(() => {
    const base = "text-xs px-2 py-0.5 rounded-full border";
    if (status === "live") return `${base} border-green-500 text-green-600`;
    if (status === "offline") return `${base} border-amber-500 text-amber-600`;
    if (status === "checking") return `${base} border-gray-400 text-gray-600`;
    return `${base} border-red-500 text-red-600`;
  }, [status]);

  function setError(label: string, data?: any) {
    const msg =
      label +
      (data
        ? ` | type=${data?.type ?? ""} details=${data?.details ?? ""} fatal=${data?.fatal ?? ""}`
        : "");
    setLastErr(msg);
    // Also log to console for deeper inspection
    // eslint-disable-next-line no-console
    console.warn("[LivePlayer] ", msg, data ?? "");
    setStatus("error");
  }

  // Attach HLS to the <video> element
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setLastErr(null);

    if (!hls) {
      setStatus("offline");
      return;
    }

    // Clean previous instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // Native HLS path (Safari / iOS)
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = hls;

      const onCanPlay = () => setStatus("live");
      const onError = () => setError("native video error");
      const onStalled = () => setStatus("checking");
      const onWaiting = () => setStatus("checking");

      video.addEventListener("canplay", onCanPlay);
      video.addEventListener("error", onError);
      video.addEventListener("stalled", onStalled);
      video.addEventListener("waiting", onWaiting);

      video.play().catch(() => {});

      return () => {
        video.removeEventListener("canplay", onCanPlay);
        video.removeEventListener("error", onError);
        video.removeEventListener("stalled", onStalled);
        video.removeEventListener("waiting", onWaiting);
      };
    }

    // hls.js path (Chrome/Firefox/Edge)
    if (Hls.isSupported()) {
      const instance = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60,
      });
      hlsRef.current = instance;

      instance.attachMedia(video);
      instance.on(Hls.Events.MEDIA_ATTACHED, () => {
        instance.loadSource(hls);
      });

      instance.on(Hls.Events.MANIFEST_PARSED, () => {
        setStatus("checking");
        video.play().catch(() => {});
      });

      instance.on(Hls.Events.LEVEL_LOADED, (_e, data) => {
        const hasFrags = data.details?.fragments?.length > 0;
        setStatus(hasFrags ? "live" : "offline");
        setLastCheck(new Date());
      });

      instance.on(Hls.Events.FRAG_LOADED, () => {
        setStatus("live");
        setLastCheck(new Date());
      });

      instance.on(Hls.Events.ERROR, (_e, data) => {
        // Try to auto-recover from non-fatal errors
        if (!data.fatal) {
          setStatus((s) => (s === "live" ? "live" : "checking"));
          setLastErr(
            `non-fatal ${data.type}/${data.details}`
          );
          return;
        }

        // Fatal errors: attempt recovery strategies
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            setLastErr(`fatal NETWORK_ERROR/${data.details} â€” trying to recover`);
            instance.startLoad();
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            setLastErr(`fatal MEDIA_ERROR/${data.details} â€” trying to recover`);
            instance.recoverMediaError();
            break;
          default:
            setError("fatal unknown error", data);
            instance.destroy();
            hlsRef.current = null;
            break;
        }
      });

      return () => {
        instance.destroy();
      };
    }

    // Old browsers
    setError("hls.js not supported");
  }, [hls]);

  // Periodic HEAD/GET check to update status when offline/coming online
  useEffect(() => {
    if (!hls) return;
    let stopped = false;

    async function checkOnce() {
      try {
        const url = new URL(hls);
        url.searchParams.set("_t", String(Date.now()));
        const res = await fetch(url.toString(), { method: "GET", cache: "no-store" });

        if (!res.ok) {
          if (!stopped) {
            setLastErr(`playlist HTTP ${res.status}`);
            setStatus("error");
            setLastCheck(new Date());
          }
          return;
        }

        const text = await res.text();
        const hasSegments = /#EXTINF:/m.test(text);
        if (!stopped) {
          setStatus(hasSegments ? "live" : "offline");
          setLastCheck(new Date());
        }
      } catch (e) {
        if (!stopped) {
          setLastErr("playlist fetch error");
          setStatus("error");
          setLastCheck(new Date());
        }
      }
    }

    checkOnce();
    const id = setInterval(checkOnce, checkIntervalMs);
    return () => {
      stopped = true;
      clearInterval(id);
    };
  }, [hls, checkIntervalMs]);

  return (
    <div className="w-full">
      {/* Header with status badge */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold">{title}</h2>
          <span className={badge}>
            {status === "live" && "Live"}
            {status === "offline" && "Offline"}
            {status === "checking" && "Checkingâ€¦"}
            {status === "error" && "Stream Error"}
          </span>
        </div>
        <div className="text-xs text-gray-500">
          {lastCheck ? `Last check: ${lastCheck.toLocaleTimeString()}` : ""}
        </div>
      </div>

      {/* Player */}
      <div className="rounded-b-2xl border-t p-0 overflow-hidden">
        {hls ? (
          <video
            ref={videoRef}
            className="w-full aspect-video bg-black"
            controls
            playsInline
            muted
            autoPlay
            // Helps with CORS on some setups (e.g., localhost)
            crossOrigin="anonymous"
          />
        ) : (
          <div className="p-6">
            <div className="w-full aspect-video rounded-xl bg-black/90 grid place-items-center text-white">
              <div className="text-center px-6">
                <p className="text-lg font-semibold">No HLS URL configured</p>
                <p className="text-sm text-gray-300 mt-1">
                  Set <code className="px-1.5 py-0.5 bg-white/10 rounded">NEXT_PUBLIC_LIVE_HLS_URL</code> and refresh.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error detail (if any) */}
      {lastErr && (
        <div className="text-xs text-red-600 p-3 border-t">
          {lastErr}
        </div>
      )}
    </div>
  );
}
