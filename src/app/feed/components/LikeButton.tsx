"use client";

import { useState, useCallback } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

type Props = {
  postId: string;
  initialLiked: boolean;
  initialCount: number;
};

export default function LikeButton({ postId, initialLiked, initialCount }: Props) {
  const [liked, setLiked] = useState<boolean>(initialLiked);
  const [count, setCount] = useState<number>(initialCount);
  const [busy, setBusy] = useState<boolean>(false);

  const toggle = useCallback(async () => {
    if (busy) return;
    setBusy(true);

    try {
      const supabase = supabaseBrowser(); // <-- instantiate client
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("Please sign in to like posts.");
        return;
      }

      // optimistic update
      setLiked((v) => !v);
      setCount((c) => (liked ? Math.max(0, c - 1) : c + 1));

      if (!liked) {
        // like -> insert
        const { error } = await supabase.from("likes").insert([{ post_id: postId, user_id: user.id }]);
        if (error) throw error;
      } else {
        // unlike -> delete
        const { error } = await supabase
          .from("likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);
        if (error) throw error;
      }
    } catch (e) {
      // rollback optimistic update on failure
      setLiked(initialLiked);
      setCount(initialCount);
      console.error("like toggle failed:", e);
      alert("Could not update like. Please try again.");
    } finally {
      setBusy(false);
    }
  }, [busy, liked, postId, initialLiked, initialCount]);

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className={`text-sm rounded-xl border px-2 py-1 ${liked ? "bg-pink-50 border-pink-200" : "bg-white"}`}
      aria-pressed={liked}
      aria-label={liked ? "Unlike" : "Like"}
      title={liked ? "Unlike" : "Like"}
    >
      {liked ? "♥" : "♡"} {count}
    </button>
  );
}
