"use client";

import React, { useRef, useState } from "react";
import BannerUploader from "@/components/BannerUploader";

function centsFromDollars(input: string) {
  const n = parseFloat(input);
  return Number.isFinite(n) ? Math.round(n * 100) : null;
}
function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function TournamentCreateForm({ ownerId, onCreated }: { ownerId: string; onCreated?: (slug: string) => void; }) {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formRef.current) return;

    setSaving(true);
    setErr(null);

    const fd = new FormData(formRef.current);
    if (bannerUrl) fd.set("banner_url", bannerUrl);

    try {
      const res = await fetch("/api/tournaments/create", { method: "POST", body: fd });
      const text = await res.text();
      if (res.redirected) {
        if (onCreated) onCreated(res.url);
        window.location.href = res.url;
        return;
      }
      if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
    } catch (e: any) {
      setErr(e.message || "Failed to create tournament");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      {/* Banner */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">Banner</label>
        <BannerUploader userId={ownerId} initialUrl={null} onUploaded={setBannerUrl} />
        <input type="hidden" name="banner_url" value={bannerUrl ?? ""} />
      </div>

      {/* Basics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input name="name" required className="w-full border rounded-xl px-3 py-2" placeholder="Fall 9-Ball Open" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Start time</label>
          <input type="datetime-local" name="starts_at" required className="w-full border rounded-xl px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">City</label>
          <input name="city" className="w-full border rounded-xl px-3 py-2" placeholder="Pensacola, FL" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Format</label>
          <input name="format" className="w-full border rounded-xl px-3 py-2" placeholder="9-ball race to 7, double elim" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Entry fee (USD)</label>
          <input name="entry_fee" inputMode="decimal" className="w-full border rounded-xl px-3 py-2" placeholder="25.00" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea name="description" rows={4} className="w-full border rounded-xl px-3 py-2" placeholder="Rules, payouts, contact info, etc." />
      </div>

      {err && <p className="text-red-600">{err}</p>}
      <button type="submit" disabled={saving} className="rounded-2xl px-5 py-2 border shadow bg-black text-white disabled:opacity-50">
        {saving ? "Creating…" : "Create tournament"}
      </button>
    </form>
  );
}
