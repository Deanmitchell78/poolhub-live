"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

type Props = {
  postId: string;
  className?: string;
};

export default function PostDeleteButton({ postId, className }: Props) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onDelete() {
    if (busy) return;
    if (!confirm("Delete this post?")) return;

    setBusy(true);
    setErr(null);
    try {
      const supabase = supabaseBrowser(); // <-- instantiate client
      const { error } = await supabase.from("posts").delete().eq("id", postId);
      if (error) throw error;
      // simple refresh
      window.location.reload();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setErr(msg);
      // eslint-disable-next-line no-alert
      alert(`Could not delete: ${msg}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={className}>
      <button
        onClick={onDelete}
        disabled={busy}
        className="text-xs rounded-xl border px-2 py-1"
        aria-label="Delete post"
        title="Delete post"
      >
        {busy ? "Deleting…" : "Delete"}
      </button>
      {err ? (
        <div className="mt-1 text-xs text-red-600">{err}</div>
      ) : null}
    </div>
  );
}
