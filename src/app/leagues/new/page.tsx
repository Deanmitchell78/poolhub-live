"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

function slugify(input: string) {
  return (input || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 60);
}

export default function NewLeaguePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setSaving(true);
    try {
      const supabase = supabaseBrowser();

      const slug = slugify(name) || `league-${Date.now()}`;
      const { error } = await supabase
        .from("leagues")
        .insert([{ name: name || null, city: city || null, state: state || null, slug }]);

      if (error) throw error;

      // Navigate without passing any handler props to parent
      router.push(`/leagues/${slug}`);
      router.refresh();
    } catch (e: any) {
      setErr(e?.message || String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Create League</h1>

      {err ? (
        <div className="rounded-xl p-3 bg-red-50 border border-red-200 text-red-700">
          {err}
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">League name</label>
          <input
            className="w-full border rounded-xl px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Emerald Coast 9-Ball"
            required
          />
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">City</label>
            <input
              className="w-full border rounded-xl px-3 py-2"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="DeFuniak Springs"
            />
          </div>
          <div className="w-32">
            <label className="block text-sm font-medium mb-1">State</label>
            <input
              className="w-full border rounded-xl px-3 py-2"
              value={state}
              onChange={(e) => setState(e.target.value.toUpperCase())}
              placeholder="FL"
              maxLength={2}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-2xl border px-4 py-2"
        >
          {saving ? "Creating…" : "Create league"}
        </button>
      </form>
    </main>
  );
}
