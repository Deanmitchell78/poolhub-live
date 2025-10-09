'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";

// Convert a datetime-local string (local time, no zone) into an ISO string with the correct offset applied.
function toISOWithLocalOffset(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    throw new Error("Please pick a valid date/time.");
  }
  const utcMs = d.getTime() - d.getTimezoneOffset() * 60000;
  return new Date(utcMs).toISOString();
}

function extractApiError(x: unknown): string | null {
  if (typeof x === "object" && x !== null && "error" in x) {
    const err = (x as Record<string, unknown>).error;
    if (typeof err === "string") return err;
  }
  return null;
}

export default function EventForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [description, setDescription] = useState("");
  const [saved, setSaved] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaved("");
    setError("");

    try {
      const startsAtISO = toISOWithLocalOffset(startsAt);
      const endsAtISO = endsAt ? toISOWithLocalOffset(endsAt) : undefined;

      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          startsAt: startsAtISO,
          endsAt: endsAtISO,
          city: city || undefined,
          state: state || undefined,
          description: description || undefined,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = extractApiError(data) ?? `HTTP ${res.status}`;
        throw new Error(msg);
      }

      setSaved("Event created ✔");
      router.push("/events");
      router.refresh();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Save failed.";
      setError(msg);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-xl space-y-4">
      {error ? <div className="text-red-600 text-sm">{error}</div> : null}
      {saved ? <div className="text-green-700 text-sm">{saved}</div> : null}

      <label className="block">
        <div className="text-sm font-medium mb-1">Title</div>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded border px-3 py-2"
          placeholder="Weekly 9-ball tournament"
          required
        />
      </label>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          <div className="text-sm font-medium mb-1">Starts</div>
          <input
            type="datetime-local"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            className="w-full rounded border px-3 py-2"
            required
          />
        </label>
        <label className="block">
          <div className="text-sm font-medium mb-1">Ends (optional)</div>
          <input
            type="datetime-local"
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
            className="w-full rounded border px-3 py-2"
          />
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          <div className="text-sm font-medium mb-1">City</div>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full rounded border px-3 py-2"
            placeholder="Pensacola"
          />
        </label>
        <label className="block">
          <div className="text-sm font-medium mb-1">State</div>
          <input
            value={state}
            onChange={(e) => setState(e.target.value.toUpperCase())}
            className="w-full rounded border px-3 py-2"
            placeholder="FL"
            maxLength={2}
          />
        </label>
      </div>

      <label className="block">
        <div className="text-sm font-medium mb-1">Description (optional)</div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded border px-3 py-2"
          rows={4}
          placeholder="Add format, entry fee, added money, stream link…"
        />
      </label>

      <button type="submit" className="px-4 py-2 rounded border">Create Event</button>

      <p className="text-xs text-gray-500">
        Times are saved in UTC; your local time is converted for accuracy.
      </p>
    </form>
  );
}
