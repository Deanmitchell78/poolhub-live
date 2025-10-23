"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function OnboardingClient() {
  const [raw, setRaw] = useState("");
  const username = useMemo(() => raw.toLowerCase(), [raw]);
  const [fullName, setFullName] = useState("");
  const [available, setAvailable] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Require auth for this page
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) window.location.href = "/sign-in";
    })();
  }, []);

  // Live username availability check
  useEffect(() => {
    const t = setTimeout(async () => {
      setError(null);
      if (!username) { setAvailable(null); return; }
      if (!/^[a-z0-9_.]{3,20}$/.test(username)) { setAvailable(false); return; }
      const { data, error } = await supabase.rpc("check_handle_available", { p_handle: username });
      if (error) { setAvailable(null); return; }
      setAvailable(!!data);
    }, 300);
    return () => clearTimeout(t);
  }, [username]);

  async function save() {
    try {
      setSaving(true);
      setError(null);
      if (!/^[a-z0-9_.]{3,20}$/.test(username)) {
        throw new Error("Invalid username (use 3–20: a–z, 0–9, _ or .)");
      }
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ handle: username, full_name: fullName }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.message || `HTTP ${res.status}`);
      window.location.href = `/profile/${username}`;
    } catch (e: any) {
      setError(e.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-bold mb-1">Finish your profile</h1>
      <p className="text-sm text-gray-600 mb-6">
        Pick a public username and (optionally) your full name.
      </p>

      <label className="block text-sm font-medium mb-1">Username</label>
      <input
        className="w-full border rounded-xl px-3 py-2 mb-2"
        placeholder="e.g. dean.mitchell"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
      />
      {available === true && <p className="text-sm">✅ Username is available</p>}
      {available === false && <p className="text-sm text-red-600">❌ Username unavailable or invalid</p>}
      {available === null && username && <p className="text-sm text-gray-500">Checking…</p>}

      <label className="block text-sm font-medium mt-4 mb-1">Full name (optional)</label>
      <input
        className="w-full border rounded-xl px-3 py-2 mb-4"
        placeholder="Dean Mitchell"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
      />

      {error && <p className="text-red-600 mb-3">{error}</p>}

      <button
        className="rounded-2xl px-4 py-2 border shadow disabled:opacity-50"
        disabled={!username || available === false || saving}
        onClick={save}
      >
        {saving ? "Saving…" : "Save & continue"}
      </button>

      <p className="text-xs text-gray-500 mt-4">
        Usernames are 3–20 characters and can include lowercase letters, numbers, underscores, and dots. Usernames are public.
      </p>
    </main>
  );
}
