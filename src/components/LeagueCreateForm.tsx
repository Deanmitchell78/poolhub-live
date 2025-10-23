"use client";

import React, { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

type Props = {
  onCreated?: (id: string) => void;
};

export default function LeagueCreateForm({ onCreated }: Props) {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    try {
      const { data: { user }, error: userErr } = await supabaseBrowser.auth.getUser();
      if (userErr || !user) throw new Error("Please sign in.");

      // Adjust the table/columns if your schema is different
      const { data, error } = await supabaseBrowser
        .from("leagues")
        .insert({
          owner_id: user.id,
          name: name.trim(),
          city: city.trim() || null,
          state: state.trim() || null,
        })
        .select("id")
        .single();

      if (error) throw new Error(error.message);

      setMsg("League created!");
      setName(""); setCity(""); setState("");
      onCreated?.(data.id);
    } catch (err: any) {
      setMsg(err?.message ?? "Failed to create league");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <input
        className="w-full border rounded-xl p-3"
        placeholder="League name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <div className="flex gap-2">
        <input
          className="flex-1 border rounded-xl p-3"
          placeholder="City (optional)"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <input
          className="w-28 border rounded-xl p-3"
          placeholder="State"
          value={state}
          onChange={(e) => setState(e.target.value)}
          maxLength={2}
        />
      </div>
      <button className="px-4 py-2 rounded-2xl border" disabled={loading}>
        {loading ? "Creating…" : "Create league"}
      </button>
      {msg && <p className="text-sm">{msg}</p>}
    </form>
  );
}
