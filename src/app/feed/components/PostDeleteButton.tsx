"use client";

import React, { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function PostDeleteButton({ postId }: { postId: string }) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleDelete() {
    if (!confirm("Delete this post?")) return;
    setLoading(true);
    setErr(null);
    try {
      const { error } = await supabaseBrowser.from("posts").delete().eq("id", postId);
      if (error) throw error;
      // Simple refresh of the feed
      window.location.reload();
    } catch (e: any) {
      setErr(e?.message ?? "Failed to delete");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ml-auto">
      <button
        onClick={handleDelete}
        disabled={loading}
        className="text-xs text-red-600 underline"
      >
        {loading ? "Deleting..." : "Delete"}
      </button>
      {err && <p className="text-xs text-red-500 mt-1">{err}</p>}
    </div>
  );
}
