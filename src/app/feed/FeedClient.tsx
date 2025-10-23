"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import Hls from "hls.js";
import { supabaseBrowser } from "@/lib/supabase-browser";

type Profile = {
  full_name: string | null;
  handle: string | null;
  avatar_url: string | null;
} | null;

type PostRow = {
  id: string;
  content: string | null;
  image_url: string | null;
  created_at: string;
  author_id: string;
  author: Profile;
};

const FK_NAME = "posts_author_id_profiles_fk";
const MP4_RE = /\.mp4(?:$|\?|\#)/i;
const HLS_RE = /\.m3u8(?:$|\?|\#)/i;
function isMp4(url?: string | null) { return !!url && MP4_RE.test(url); }
function isHls(url?: string | null) { return !!url && HLS_RE.test(url); }
function looksLikeImage(url?: string | null) { return !!url && /\.(?:jpg|jpeg|png|gif|webp|avif)(?:$|\?|\#)/i.test(url); }
function pickMediaFromImageUrl(image_url: string | null) {
  if (!image_url) return { kind: "none" as const };
  if (isMp4(image_url) || isHls(image_url)) return { kind: "video" as const, src: image_url, poster: null };
  if (looksLikeImage(image_url)) return { kind: "image" as const, src: image_url };
  return { kind: "none" as const };
}

function VideoPlayer({ src, poster }: { src: string; poster?: string | null }) {
  const ref = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    const video = ref.current;
    if (!video || !src) return;
    if (isHls(src)) {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
      } else if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(src);
        hls.attachMedia(video);
        return () => hls.destroy();
      }
    } else {
      video.src = src;
    }
  }, [src]);
  return (
    <div className="rounded-xl overflow-hidden border">
      <video ref={ref} controls preload="metadata" poster={poster || undefined} className="w-full h-auto bg-black" playsInline crossOrigin="anonymous" />
    </div>
  );
}

export default function FeedClient({ userId: initialUserId }: { userId: string | null }) {
  const [userId, setUserId] = useState<string | null>(initialUserId);
  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState<string | null>(null);
  const [uploadPct, setUploadPct] = useState<number>(0);
  const [posting, setPosting] = useState(false);
  const [postErr, setPostErr] = useState<string | null>(null);

  const [posts, setPosts] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setErr(null);
    const supabase = supabaseBrowser();
    const { data, error } = await supabase
      .from("posts")
      .select(`
        id, content, image_url, created_at, author_id,
        author:profiles!${FK_NAME}(full_name, handle, avatar_url)
      `)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) setErr(error.message); else setPosts((data as any) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!initialUserId) {
      fetch("/api/whoami", { cache: "no-store" })
        .then((r) => r.json())
        .then((j) => { if (j?.userId) setUserId(j.userId); })
        .catch(() => {});
    }
    loadPosts();
    const supabase = supabaseBrowser();
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, [initialUserId, loadPosts]);

  async function handleCreatePost(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    setPosting(true);
    setPostErr(null);
    try {
      const supabase = supabaseBrowser();
      const { error } = await supabase.from("posts").insert([{
        content: content || null,
        image_url: mediaUrl || null,
        author_id: userId,
      }]);
      if (error) throw error;
      setContent(""); setMediaUrl(""); await loadPosts();
    } catch (e: any) {
      setPostErr(e?.message || String(e));
    } finally { setPosting(false); }
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    setUploadErr(null); setUploading(true); setUploadPct(0);
    try {
      const ok = ["image/jpeg","image/png","image/webp","image/avif","image/gif","video/mp4"];
      if (!ok.includes(file.type)) throw new Error("Unsupported file type.");
      const supabase = supabaseBrowser();
      const ts = Date.now();
      const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `${userId}/${ts}-${cleanName}`;
      const up = await supabase.storage.from("posts").upload(path, file, {
        upsert: false, cacheControl: "3600", contentType: file.type,
      });
      if (up.error) throw up.error;
      const pub = supabase.storage.from("posts").getPublicUrl(path);
      const publicUrl = pub.data.publicUrl;
      if (!publicUrl) throw new Error("Could not get public URL.");
      setMediaUrl(publicUrl); setUploadPct(100);
    } catch (e: any) {
      setUploadErr(e?.message || String(e));
    } finally { setUploading(false); e.target.value = ""; }
  }

  const mediaPreview = pickMediaFromImageUrl(mediaUrl || null);

  return (
    <main className="max-w-2xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Feed</h1>

      {userId ? (
        <section className="rounded-2xl border p-4 space-y-3">
          <h2 className="text-lg font-semibold">Create a post</h2>
          {postErr ? <div className="rounded-xl p-3 bg-red-50 border border-red-200 text-red-700 text-sm">{postErr}</div> : null}

          <form onSubmit={handleCreatePost} className="space-y-3">
            <textarea className="w-full border rounded-xl px-3 py-2 min-h-[90px]" value={content} onChange={(e) => setContent(e.target.value)} placeholder="What’s on your mind?" />
            <div className="grid gap-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <input className="w-full border rounded-xl px-3 py-2" value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} placeholder="Optional media URL (auto-filled when you upload)" />
                <label className="inline-flex items-center gap-2">
                  <span className="rounded-2xl border px-3 py-2 cursor-pointer">Choose file</span>
                  <input type="file" accept="image/*,video/mp4" onChange={handleFile} className="hidden" />
                </label>
              </div>
              {uploading ? <div className="text-sm text-gray-600">Uploading… {uploadPct}%</div> : uploadErr ? (
                <div className="rounded-xl p-2 bg-red-50 border border-red-200 text-red-700 text-sm">{uploadErr}</div>
              ) : null}

              {mediaUrl ? (
                <div className="mt-1">
                  {mediaPreview.kind === "image" ? (
                    <div className="rounded-xl overflow-hidden border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={mediaPreview.src} alt="preview" className="w-full h-auto" />
                    </div>
                  ) : mediaPreview.kind === "video" ? (
                    <VideoPlayer src={mediaPreview.src} poster={null} />
                  ) : (
                    <div className="text-sm text-gray-600">Unsupported preview; will still attach URL.</div>
                  )}
                </div>
              ) : null}
            </div>

            <div className="flex items-center gap-3">
              <button type="submit" disabled={posting} className="rounded-2xl border px-4 py-2">{posting ? "Posting…" : "Post"}</button>
              <span className="text-xs text-gray-500">Tip: Upload a file or paste any https URL.</span>
            </div>
          </form>
        </section>
      ) : (
        <div className="rounded-2xl border p-4">
          <p className="text-gray-600">
            Please <Link className="underline" href="/sign-in?redirect=/feed">sign in</Link> to create a post.
          </p>
        </div>
      )}

      {loading ? (
        <p>Loading…</p>
      ) : err ? (
        <div className="rounded-xl p-4 bg-red-50 border border-red-200">
          <p className="font-semibold">Error loading feed</p>
          <p className="text-sm text-red-700 break-all">{err}</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {posts.map((p) => {
            const a = p.author;
            const media = pickMediaFromImageUrl(p.image_url);
            return (
              <li key={p.id} className="rounded-2xl border p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100">
                    {a?.avatar_url ? (
                      <Image src={a.avatar_url} alt={a?.full_name ?? "avatar"} width={40} height={40} className="w-10 h-10 object-cover" />
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{a?.full_name ?? "Unknown"}</div>
                    <div className="text-sm text-gray-500 truncate">
                      {a?.handle ? <Link href={`/u/${a.handle}`}>@{a.handle}</Link> : <span className="italic text-gray-400">no handle</span>}
                    </div>
                  </div>
                  <div className="ml-auto text-sm text-gray-500">{new Date(p.created_at).toLocaleString()}</div>
                </div>
                {p.content ? <p className="whitespace-pre-wrap mb-3">{p.content}</p> : null}
                {media.kind === "video" ? <VideoPlayer src={media.src} poster={null} /> :
                 media.kind === "image" ? (
                  <div className="rounded-xl overflow-hidden border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={media.src} alt="post image" className="w-full h-auto" />
                  </div>
                 ) : null}
              </li>
            );
          })}
          {posts.length === 0 && <div className="text-gray-500">No posts yet.</div>}
        </ul>
      )}
    </main>
  );
}
