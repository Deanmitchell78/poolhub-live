"use client";

import { useEffect } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function CallbackPage() {
  useEffect(() => {
    (async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      const redirectTo = "/feed";

      try {
        // If Supabase sent us a code (magic link / OAuth), exchange it for a session
        if (code) {
          const { error } = await supabaseBrowser.auth.exchangeCodeForSession(code);
          if (error) console.error("exchangeCodeForSession error:", error.message);
        } else {
          // Fallback: touch auth to ensure cookies/session are set if already valid
          await supabaseBrowser.auth.getUser();
        }
      } finally {
        window.location.replace(redirectTo);
      }
    })();
  }, []);

  return (
    <main className="max-w-md mx-auto p-10">
      <p>Finalizing sign-in…</p>
      <p className="text-sm text-gray-500">You’ll be redirected in a moment.</p>
    </main>
  );
}
