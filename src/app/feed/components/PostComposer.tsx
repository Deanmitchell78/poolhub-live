"use client";

import { useCallback, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

type Props = {
  onCreated?: () => void;
};

export default function PostComposer({ onCreated }: Props) {
  const [content, setContent] = useState<string>("");
  const [mediaUrl, setMediaUrl] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);
  const [posting, setPosting] = useState<boolean>(false);
  const [err, setErr] = useState<string | null>(null);

  const handleFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setErr(null);
      setUploading(true);
      try {
        const supabase = supabaseBrowser();

        // make sure user is signed in (also gets userId for path)
        const { data: { user }, error: userErr } = await supabase.auth.getUser();
        if (userErr || !user) throw new Error("Please sign in to upload.");

        const okTypes = [
          "image/jpeg", "image/png", "image/webp", "image/avif", "image/gif",
          "video/mp4"
        ];
        if (!okTypes.includes(file.type)) {
          throw new Error("Unsupported file type (use JPG/PNG/WebP/AVIF/GIF or MP4).");
        }

        const ts = Date.now();
        const clean = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const path = `${user.id}/${ts}-${clean}`;

        const up = await supabase.storage.from("posts").upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });
        if (up.error) throw up.error;

        const pub = supabase.storage.from("posts").getPublicUrl(path);
        const url = pub.data.publicUrl;
        if (!url) throw new Error("Could not get public URL.");

        setMediaUrl(url);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setErr(msg);
      } finally {
        setUploading(false);
        // allow re-selecting the same file
        e.target.value = "";
      }
    },
    []
  );

  const submit = useCallback(
    async (ev: React.FormEvent) => {
      ev.preventDefault();
      if (posting) return;
      setPosting(true);
      setErr(null);

      try {
        const supabase = supabaseBrowser();

        // Ensure we have a session
        const { data: { user }, error: userErr } = await supabase.auth.getUser();
        if (userErr || !user) throw new Error("Please sign in to post.");

        const payload = {
          author_id: user.id,
          content: content || null,
          image_url: mediaUrl || null,
        };

        const { error } = await supabase.from("posts").insert([payload]);
        if (error) throw error;

        setContent("");
        setMediaUrl("");
        onCreated?.();
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setErr(msg);
      } finally {
        setPosting(false);
      }
    },
    [posting, content, mediaUrl, onCreated]
  );

  return (
    <section className="rounded-2xl border p-4 space-y-3 bg-white">
      <h2 className="text-lg font-semibold">Create a post</h2>

      {err ? (
        <div className="rounded-xl p-3 bg-red-50 border border-red-200 text-red-700 text-sm">
          {err}
        </div>
      ) : null}

      <form onSubmit={submit} className="space-y-3">
        <textarea
          className="w-full border rounded-xl px-3 py-2 min-h-[90px]"
          placeholder="What’s on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <div className="grid gap-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <input
              className="w-full border rounded-xl px-3 py-2"
              placeholder="Optional media URL (auto-filled after upload)"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
            />
            <label className="inline-flex items-center gap-2">
              <span className="rounded-2xl border px-3 py-2 cursor-pointer">
                Choose file
              </span>
              <input
                type="file"
                accept="image/*,video/mp4"
                onChange={handleFile}
                className="hidden"
              />
            </label>
          </div>
          {uploading ? (
            <div className="text-sm text-gray-600">Uploading…</div>
          ) : null}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={posting}
            className="rounded-2xl border px-4 py-2"
          >
            {posting ? "Posting…" : "Post"}
          </button>
          <span className="text-xs text-gray-500">
            Tip: Upload a file or paste any https URL.
          </span>
        </div>
      </form>
    </section>
  );
}
