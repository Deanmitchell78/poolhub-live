"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase-browser";

type ProfileRow = {
  id: string;
  full_name: string | null;
  handle: string | null;
  about: string | null;
  shaft: string | null;
};

export default function MePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string>("");
  const [handle, setHandle] = useState<string>("");
  const [about, setAbout] = useState<string>("");
  const [shaft, setShaft] = useState<string>("");

  useEffect(() => {
    const supabase = supabaseBrowser();

    const load = async () => {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userData?.user) {
        setError(userErr?.message || "Not signed in.");
        setLoading(false);
        return;
      }

      const uid = userData.user.id;
      setUserId(uid);

      // fetch profile
      const { data: prof, error: profErr } = await supabase
        .from("profiles")
        .select("id, full_name, handle, about, shaft")
        .eq("id", uid)
        .maybeSingle();

      if (profErr) {
        setError(profErr.message);
      } else if (prof) {
        setFullName(prof.full_name ?? "");
        setHandle(prof.handle ?? "");
        setAbout(prof.about ?? "");
        setShaft(prof.shaft ?? "");
      } else {
        // create stub row if missing
        const { error: insErr } = await supabase
          .from("profiles")
          .insert([{ id: uid, full_name: null, handle: null, about: null, shaft: null }]);
        if (insErr) setError(insErr.message);
      }

      setLoading(false);
    };

    load();
  }, []);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    const supabase = supabaseBrowser();
    const { error: updErr } = await supabase
      .from("profiles")
      .update({
        full_name: fullName || null,
        handle: handle || null,
        about: about || null,
        shaft: shaft || null,
      })
      .eq("id", userId);

    if (updErr) setError(updErr.message);
    else setSuccess("Profile saved.");
    setSaving(false);
  };

  if (loading) {
    return (
      <main className="max-w-xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-3">My Profile</h1>
        <p>Loading…</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-3">My Profile</h1>
        <div className="rounded-xl p-4 bg-red-50 border border-red-200 mb-4">
          <p className="font-semibold">Error</p>
          <p className="text-sm text-red-700 break-all">{error}</p>
        </div>
        <p>
          <Link className="underline" href="/(auth)/sign-in">
            Sign in
          </Link>
        </p>
      </main>
    );
  }

  return (
    <main className="max-w-xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Profile</h1>
        {handle ? (
          <Link className="underline" href={`/u/${handle}`}>
            View public profile
          </Link>
        ) : null}
      </div>

      {success ? (
        <div className="rounded-xl p-3 bg-green-50 border border-green-200 text-green-800">
          {success}
        </div>
      ) : null}

      <form onSubmit={onSave} className="space-y-6">
        {/* Identity */}
        <section className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full name</label>
            <input
              type="text"
              className="w-full border rounded-xl px-3 py-2"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Handle <span className="text-gray-500">(public @username)</span>
            </label>
            <input
              type="text"
              className="w-full border rounded-xl px-3 py-2"
              value={handle}
              onChange={(e) => setHandle(e.target.value.replace(/\s/g, ""))}
              placeholder="e.g. deanmitchell"
            />
            <p className="text-xs text-gray-500 mt-1">
              Letters/numbers only; shown as <code>/u/&lbrace;handle&rbrace;</code>.
            </p>
          </div>
        </section>

        {/* About */}
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">About me</h2>
          <textarea
            className="w-full border rounded-xl px-3 py-2 min-h-[140px]"
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            placeholder="Tell other players about yourself: leagues, cue, favorite games, home room, etc."
          />
        </section>

        {/* Equipment */}
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Equipment</h2>
          <label className="block text-sm font-medium mb-1">Shaft</label>
          <input
            type="text"
            className="w-full border rounded-xl px-3 py-2"
            value={shaft}
            onChange={(e) => setShaft(e.target.value)}
            placeholder="e.g., Predator 314-3, REVO 12.4, Cuetec Cynergy 12.5…"
          />
        </section>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-2xl border px-4 py-2"
        >
          {saving ? "Saving…" : "Save profile"}
        </button>
      </form>
    </main>
  );
}
