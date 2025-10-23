"use client";

import React, { useRef, useState } from "react";
import BannerUploader from "@/components/BannerUploader";

function toISOWithLocalOffset(value: string): string {
  const d = new Date(value);
  return isNaN(d.getTime()) ? "" : d.toISOString();
}
function extractApiError(x: unknown): string | null {
  if (!x) return null;
  if (typeof x === "string") return x;
  try { const o = JSON.parse(String(x)); return o?.error || o?.message || null; } catch { return null; }
}

export default function EventForm() {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formRef.current) return;

    setSaving(true);
    setErr(null);

    const fd = new FormData(formRef.current);
    if (bannerUrl) fd.set("banner_url", bannerUrl);

    try {
      const res = await fetch("/api/events/create", { method: "POST", body: fd });
      if (res.redirected) { window.location.href = res.url; return; }
      const text = await res.text();
      if (!res.ok) throw new Error(extractApiError(text) || `HTTP ${res.status}`);
    } catch (e: any) {
      setErr(e.message || "Failed to create event");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-6">
      {/* Banner */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">Banner</label>
        <BannerUploader userId={"self"} initialUrl={null} onUploaded={setBannerUrl} />
        <input type="hidden" name="banner_url" value={bannerUrl ?? ""} />
      </div>

      {/* Basics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input name="title" required className="w-full border rounded-xl px-3 py-2" placeholder="Weekly 9-Ball" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Start time</label>
          <input type="datetime-local" name="starts_at" required className="w-full border rounded-xl px-3 py-2" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea name="description" rows={4} className="w-full border rounded-xl px-3 py-2" placeholder="Details, venue, etc." />
      </div>

      {err && <p className="text-red-600">{err}</p>}
      <button type="submit" disabled={saving} className="rounded-2xl px-5 py-2 border shadow bg-black text-white disabled:opacity-50">
        {saving ? "Creating…" : "Create event"}
      </button>
    </form>
  );
}
