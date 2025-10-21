"use client";

import { useRef, useState, useTransition } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

type Props = {
  userId: string;
  initialFullName: string | null;
  initialHandle: string | null;
};

const HANDLE_RE = /^[a-z0-9_]{3,24}$/; // lowercase letters, numbers, underscores

export default function ProfileForm({ userId, initialFullName, initialHandle }: Props) {
  const [fullName, setFullName] = useState(initialFullName ?? "");
  const [handle, setHandle] = useState(initialHandle ?? "");
  const [status, setStatus] =
    useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  // optional: will play if you add /public/sounds/nine-ball-break.mp3 later
  const breakAudioRef = useRef<HTMLAudioElement | null>(null);

  async function isHandleTaken(supabase: ReturnType<typeof supabaseBrowser>, h: string) {
    if (!h) return false;
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("handle", h.toLowerCase())
      .neq("id", userId)
      .maybeSingle();
    return !!data;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setMessage("");

    const supabase = supabaseBrowser();
    const normalizedHandle = handle.trim().toLowerCase();

    // Validate handle if provided
    if (normalizedHandle) {
      if (!HANDLE_RE.test(normalizedHandle)) {
        setStatus("error");
        setMessage(
          "Username must be 3–24 chars, lowercase letters/numbers/underscores only."
        );
        return;
      }
      // Friendly pre-check (DB enforces uniqueness too)
      if (await isHandleTaken(supabase, normalizedHandle)) {
        setStatus("error");
        setMessage("That username is taken. Try another.");
        return;
      }
    }

    const { error } = await supabase.from("profiles").upsert(
      {
        id: userId,
        full_name: fullName || null,
        handle: normalizedHandle || null, // allow clearing back to null
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    if (error) {
      setStatus("error");
      setMessage(error.message);
    } else {
      setStatus("saved");
      setMessage("Saved!");
      try {
        const el = breakAudioRef.current;
        if (el) {
          el.currentTime = 0;
          await el.play();
        }
      } catch {}
      startTransition(() => {});
    }
  }

  return (
    <>
      {/* preload sound (optional) */}
      <audio ref={breakAudioRef} src="/sounds/nine-ball-break.mp3" preload="auto" />
      <form onSubmit={handleSubmit} className="space-y-4 pt-4">
        <div>
          <label className="block mb-1 font-medium">Username</label>
          <input
            type="text"
            value={handle}
            onChange={(e) => setHandle(e.target.value.toLowerCase())}
            className="w-full border rounded px-3 py-2"
            placeholder="e.g. poolshark_123"
          />
          <p className="text-sm text-gray-500 mt-1">
            3–24 chars, lowercase letters, numbers, and underscores.
          </p>
        </div>

        <div>
          <label className="block mb-1 font-medium">Full name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Your name"
          />
        </div>

        <button
          type="submit"
          disabled={status === "saving" || isPending}
          className="px-4 py-2 rounded bg-black text-white"
        >
          {status === "saving" ? "Saving..." : "Save"}
        </button>

        {message && (
          <p className={status === "error" ? "text-red-600" : "text-green-700"}>
            {message}
          </p>
        )}
      </form>
    </>
  );
}
