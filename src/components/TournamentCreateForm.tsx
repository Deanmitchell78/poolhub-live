"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

type Props = {
  ownerId: string;
  onCreated?: () => void; // optional: parent can refresh list
};

const SLUG_RE = /^[a-z0-9-]{3,60}$/; // lowercase, numbers, dashes

function centsFromDollars(input: string) {
  const n = Number(input.replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? Math.round(n * 100) : null;
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export default function TournamentCreateForm({ ownerId, onCreated }: Props) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [startsAt, setStartsAt] = useState<string>(""); // datetime-local
  const [format, setFormat] = useState<string>("9-ball");
  const [skill, setSkill] = useState<string>("open");
  const [entryFee, setEntryFee] = useState<string>(""); // dollars input
  const [city, setCity] = useState<string>("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");

  function onName(v: string) {
    setName(v);
    if (!slug) setSlug(slugify(v));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setMessage("");

    const supabase = supabaseBrowser();

    const finalName = name.trim();
    const finalSlug = (slug || slugify(name)).toLowerCase();
    const feeCents = entryFee ? centsFromDollars(entryFee) : null;

    if (finalName.length < 3) {
      setStatus("error");
      setMessage("Name must be at least 3 characters.");
      return;
    }
    if (!SLUG_RE.test(finalSlug)) {
      setStatus("error");
      setMessage("Slug must be 3–60 chars, lowercase letters/numbers/dashes.");
      return;
    }

    const { error } = await supabase.from("tournaments").insert({
      owner_id: ownerId,
      name: finalName,
      slug: finalSlug,
      description: description.trim() || null,
      starts_at: startsAt ? new Date(startsAt).toISOString() : null,
      format: format || null,
      entry_fee_cents: feeCents,
      skill: skill || null,
      city: city.trim() || null,
      status: "scheduled",
    });

    if (error) {
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
    setMessage("Tournament created!");
    setName("");
    setSlug("");
    setStartsAt("");
    setFormat("9-ball");
    setSkill("open");
    setEntryFee("");
    setCity("");
    setDescription("");
    onCreated?.();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 border rounded p-4">
      <h2 className="text-lg font-semibold">Create a tournament</h2>

      <label className="block">
        <span className="block mb-1">Name</span>
        <input
          value={name}
          onChange={(e) => onName(e.target.value)}
          className="w-full border rounded px-3 py-2"
          placeholder="Saturday 9-Ball Open"
        />
      </label>

      <label className="block">
        <span className="block mb-1">Slug (URL)</span>
        <input
          value={slug}
          onChange={(e) => setSlug(slugify(e.target.value))}
          className="w-full border rounded px-3 py-2"
          placeholder="saturday-9ball-open"
        />
        <p className="text-sm text-gray-500 mt-1">
          Example URL: <code>/tournaments/saturday-9ball-open</code>
        </p>
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="block">
          <span className="block mb-1">Start time</span>
          <input
            type="datetime-local"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </label>

        <label className="block">
          <span className="block mb-1">Format</span>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <option>9-ball</option>
            <option>8-ball</option>
            <option>10-ball</option>
            <option>one-pocket</option>
            <option>straight pool</option>
          </select>
        </label>

        <label className="block">
          <span className="block mb-1">Skill</span>
          <select
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <option>open</option>
            <option>A</option>
            <option>B</option>
            <option>C</option>
            <option>amateur</option>
          </select>
        </label>

        <label className="block">
          <span className="block mb-1">Entry fee (USD)</span>
          <input
            inputMode="decimal"
            placeholder="25.00"
            value={entryFee}
            onChange={(e) => setEntryFee(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </label>
      </div>

      <label className="block">
        <span className="block mb-1">City</span>
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full border rounded px-3 py-2"
          placeholder="Las Vegas, NV"
        />
      </label>

      <label className="block">
        <span className="block mb-1">Description (optional)</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border rounded px-3 py-2"
          rows={3}
          placeholder="Double-elimination, race to 7…"
        />
      </label>

      <button
        type="submit"
        disabled={status === "saving"}
        className="px-4 py-2 rounded bg-black text-white"
      >
        {status === "saving" ? "Creating..." : "Create Tournament"}
      </button>

      {message && (
        <p className={status === "error" ? "text-red-600" : "text-green-700"}>{message}</p>
      )}
    </form>
  );
}
