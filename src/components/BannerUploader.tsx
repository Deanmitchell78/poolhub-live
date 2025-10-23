"use client";

import React, { useMemo, useRef, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const BUCKET = "banners";
const MAX_MB = 8;
const ACCEPT = ["image/jpeg", "image/png", "image/webp"];

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9.\-_]/g, "")
    .replace(/-+/g, "-")
    .slice(0, 90);
}

export default function BannerUploader({
  userId,
  initialUrl,
  onUploaded,
  ratioHint = "Recommended 1200×600",
}: {
  userId: string;
  initialUrl?: string | null;
  onUploaded: (publicUrl: string) => void;
  ratioHint?: string;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(initialUrl ?? null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const hint = useMemo(
    () => `JPEG/PNG/WEBP up to ${MAX_MB} MB • ${ratioHint}`,
    [ratioHint]
  );

  async function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;

    setErr(null);

    if (!ACCEPT.includes(file.type)) {
      setErr("Unsupported file type.");
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setErr(`File too large (max ${MAX_MB} MB).`);
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setBusy(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.id !== userId) throw new Error("Sign in required.");

      const name = slugify(file.name || "banner.png");
      const path = `${userId}/${Date.now()}-${name}`;

      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { upsert: true, cacheControl: "3600" });
      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
      onUploaded(pub.publicUrl);
    } catch (e: any) {
      setErr(e?.message || "Upload failed.");
      setPreview(initialUrl ?? null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <div
        className="relative aspect-[2/1] w-full overflow-hidden rounded-2xl border bg-white"
        onClick={() => inputRef.current?.click()}
        title="Click to upload banner"
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Banner"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full grid place-items-center text-sm text-gray-500">
            Click to upload banner
          </div>
        )}
      </div>
      <div className="text-xs text-gray-600">{busy ? "Uploading…" : hint}</div>
      {err && <div className="text-xs text-red-600">{err}</div>}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT.join(",")}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
