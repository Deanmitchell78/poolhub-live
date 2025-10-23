"use client";

import React, { useMemo, useRef, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const BUCKET = "avatars"; // <-- change if your bucket has a different name
const MAX_MB = 5;
const ACCEPT = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9.\-_]/g, "")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

export default function AvatarUploader({
  userId,
  initialUrl,
  onUploaded,
}: {
  userId: string;
  initialUrl?: string | null;
  onUploaded: (publicUrl: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(initialUrl ?? null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const hint = useMemo(
    () => `JPEG/PNG/WEBP/GIF up to ${MAX_MB} MB`,
    []
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

    // local preview
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);

    setBusy(true);
    try {
      // Ensure user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.id !== userId) {
        throw new Error("You must be signed in to upload.");
      }

      const name = slugify(file.name || "avatar.png");
      const path = `${userId}/${Date.now()}-${name}`;

      // Upload (upsert lets users replace)
      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { upsert: true, cacheControl: "3600" });
      if (upErr) throw upErr;

      // Public URL (for public bucket)
      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
      const publicUrl = pub.publicUrl;

      // hand back to parent (ProfileForm will persist to DB)
      onUploaded(publicUrl);
    } catch (e: any) {
      setErr(e?.message || "Upload failed.");
      // If upload failed, drop the optimistic preview
      setPreview(initialUrl ?? null);
    } finally {
      setBusy(false);
    }
  }

  function onPick() {
    inputRef.current?.click();
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  return (
    <div className="flex items-center gap-3">
      {/* Avatar preview */}
      <div className="relative">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Avatar"
            className="w-20 h-20 rounded-full object-cover border"
          />
        ) : (
          <div className="w-20 h-20 rounded-full border grid place-items-center text-xs text-gray-500">
            No photo
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="text-sm">
        <div
          className="rounded-xl border px-3 py-2 inline-flex items-center gap-2 cursor-pointer bg-white shadow-sm select-none"
          onClick={onPick}
          onDrop={onDrop}
          onDragOver={onDragOver}
          title="Click or drop a file"
        >
          {busy ? "Uploading…" : "Change photo"}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT.join(",")}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="text-xs text-gray-500 mt-1">{hint}</div>
        {err && <div className="text-xs text-red-600 mt-1">{err}</div>}
      </div>
    </div>
  );
}
