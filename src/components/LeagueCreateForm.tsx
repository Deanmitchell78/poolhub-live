"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

type Props = {
  ownerId: string;
  onCreated?: () => void; // optional: parent can refresh list
};

const SLUG_RE = /^[a-z0-9-]{3,40}$/; // lowercase, numbers, dashes

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export default function LeagueCreateForm({ ownerId, onCreated }: Props) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "error" | "saved">("idle");
  const [message, setMessage] = useState("");

  function handleNameChange(v: string) {
    setName(v);
    // auto-suggest slug only if user hasn't typed slug manually yet
    if (!slug) {
      setSlug(slugify(v));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setMessage("");

    const supabase = supabaseBrowser();

    const finalName = name.trim();
    const finalSlug = (slug || slugify(name)).toLowerCase();

    if (finalName.length < 3) {
      setStatus("error");
      setMessage("Name must be at least 3 characters.");
      return;
    }
    if (!SLUG_RE.test(finalSlug)) {
      setStatus("error");
      setMessage("Slug must be 3–40 chars, lowercase letters/numbers/dashes.");
      return;
    }

    const { error } = await supabase.from("leagues").insert({
      owner_id: ownerId,
      name: finalName,
      slug: finalSlug,
      description: description.trim() || null,
    });

    if (error) {
      // Handle unique constraint nicely
      if (String(error.message).toLowerCase().includes("unique")) {
        setStatus("error");
        setMessage("That slug is already taken. Try another.");
        return;
      }
      setStatus("error");
      setMessage(error.message);
      return;
    }

    setStatus("saved");
    setMessage("League created!");
    setName("");
    setSlug("");
    setDescription("");
    onCreated?.();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 border rounded p-4">
      <h2 className="text-lg font-semibold">Create a league</h2>

      <label className="block">
        <span className="block mb-1">Name</span>
        <input
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          className="w-full border rounded px-3 py-2"
          placeholder="Downtown 9-Ball League"
        />
      </label>

      <label className="block">
        <span className="block mb-1">Slug (URL)</span>
        <input
          value={slug}
          onChange={(e) => setSlug(slugify(e.target.value))}
          className="w-full border rounded px-3 py-2"
          placeholder="downtown-9ball"
        />
        <p className="text-sm text-gray-500 mt-1">
          Lowercase letters, numbers, and dashes. Example URL: <code>/leagues/downtown-9ball</code>
        </p>
      </label>

      <label className="block">
        <span className="block mb-1">Description (optional)</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border rounded px-3 py-2"
          rows={3}
          placeholder="Weekly league every Thursday night…"
        />
      </label>

      <button
        type="submit"
        disabled={status === "saving"}
        className="px-4 py-2 rounded bg-black text-white"
      >
        {status === "saving" ? "Creating..." : "Create League"}
      </button>

      {message && (
        <p className={status === "error" ? "text-red-600" : "text-green-700"}>{message}</p>
      )}
    </form>
  );
}
