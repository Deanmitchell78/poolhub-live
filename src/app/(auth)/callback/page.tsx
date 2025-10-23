"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function AuthCallbackPage() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const run = async () => {
      try {
        const redirect = params.get("redirect") || "/feed";
        const code = params.get("code");

        const supabase = supabaseBrowser(); // <-- get the client

        if (code) {
          // Exchange magic-link / OAuth code for a session
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) console.error("exchangeCodeForSession error:", error.message);
        } else {
          // Touch auth so cookies/session are ensured
          await supabase.auth.getUser();
        }

        router.replace(redirect);
        router.refresh();
      } catch (e) {
        console.error("auth callback error:", e);
        router.replace("/feed");
        router.refresh();
      }
    };
    run();
  }, [params, router]);

  return (
    <main className="max-w-md mx-auto p-6">
      <div className="rounded-2xl border shadow-sm p-6">
        <h1 className="text-xl font-semibold">Signing you in…</h1>
        <p className="text-sm text-gray-600 mt-1">Please wait.</p>
      </div>
    </main>
  );
}
