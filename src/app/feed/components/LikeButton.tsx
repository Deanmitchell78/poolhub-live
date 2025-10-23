"use client";

import React, { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

type Props = {
  postId: string;
  initialLiked: boolean;
  initialCount: number;
};

export default function LikeButton({ postId, initialLiked, initialCount }: Props) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (busy) return;
    setBusy(true);
    try {
      const { data: { user } } = await supabaseBrowser.auth.getUser();
      if (!user) {
        alert("Please sign in to like posts.");
        return;
      }

      if (!liked) {
        // like
        const { error } = await supabaseBrowser.from("likes").insert({
          post_id: postId,
          user_id: user.id,
        });
        if (error) throw error;
        setLiked(true);
        setCount(c => c + 1);
      } else {
        // unlike
        const { error } = await supabaseBrowser
          .from("likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);
        if (error) throw error;
        setLiked(false);
        setCount(c => Math.max(0, c - 1));
      }
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "Could not update like");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className={`text-xs rounded-full px-3 py-1 border ${liked ? "bg-black text-white" : ""}`}
      aria-pressed={liked}
    >
      {liked ? "♥ Liked" : "♡ Like"} · {count}
    </button>
  );
}
