"use client";

import React, { useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function PostComposer() {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isVideo, setIsVideo] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    try {
      const content = (formRef.current?.elements.namedItem("content") as HTMLTextAreaElement)?.value ?? "";
      const fileInput = formRef.current?.elements.namedItem("media") as HTMLInputElement | null;
      const file = fileInput?.files?.[0] ?? null;

      // Ensure we have a session
      const { data: { user }, error: userErr } = await supabaseBrowser.auth.getUser();
      if (userErr || !user) throw new Error("Please sign in to post.");

      // Optional media upload
      let mediaUrl: string | null = null;
      if (file) {
        const allowed = ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/webm"];
        if (!allowed.includes(file.type)) {
          throw new Error(`Unsupported file type: ${file.type}`);
        }
        if (file.size > 50 * 1024 * 1024) {
          throw new Error(`File too large (${(file.size/1024/1024).toFixed(1)}MB). Max 50MB.`);
        }

        const ext = (file.name.split(".").pop() || "bin").toLowerCase();
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`;

        // ✅ Browser upload: pass the File directly
        const { error: upErr } = await supabaseBrowser
          .storage
          .from("post-media")
          .upload(path, file, { upsert: false, contentType: file.type });

        if (upErr) throw new Error(`Storage upload failed: ${upErr.message}`);

        const { data } = supabaseBrowser.storage.from("post-media").getPublicUrl(path);
        mediaUrl = data.publicUrl;
        if (!mediaUrl) throw new Error("Public URL not returned for uploaded media");
      }

      // Insert post row from the browser (RLS enforces author = auth.uid())
      const { error: insErr } = await supabaseBrowser
        .from("posts")
        .insert({ author_id: user.id, content, image_url: mediaUrl });

      if (insErr) throw new Error(`Post insert failed: ${insErr.message}`);

      setMsg("Posted!");
      formRef.current?.reset();
      setPreviewUrl(null);
      setIsVideo(false);

      // Refresh feed
      window.location.reload();
    } catch (err: any) {
      setMsg(err?.message ?? "Post failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border p-4 mb-6">
      <h3 className="text-lg font-semibold mb-2">Create a post</h3>
      <form ref={formRef} onSubmit={onSubmit} className="space-y-3">
        <textarea
          name="content"
          placeholder="What's on your mind?"
          className="w-full border rounded-xl p-3"
          rows={3}
        />
        <input
          type="file"
          name="media"
          accept="image/png,image/jpeg,image/webp,video/mp4,video/webm"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (!f) {
              setPreviewUrl(null);
              setIsVideo(false);
              return;
            }
            const url = URL.createObjectURL(f);
            setPreviewUrl(url);
            setIsVideo(f.type.startsWith("video/"));
          }}
        />
        {previewUrl && (
          <div className="rounded-xl border p-2 bg-black/5">
            {isVideo ? (
              <video src={previewUrl} controls className="max-h-64 w-full rounded-lg" />
            ) : (
              <div className="w-full flex justify-center">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-64 w-auto rounded-lg object-contain"
                  style={{ display: "block" }}
                />
              </div>
            )}
          </div>
        )}
        <button
          className="px-4 py-2 rounded-2xl shadow border disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Posting..." : "Post"}
        </button>
      </form>
      {msg && <p className="mt-2 text-sm">{msg}</p>}
    </div>
  );
}
