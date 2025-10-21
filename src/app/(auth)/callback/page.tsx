"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

/**
 * Handles both OAuth styles:
 * - PKCE: URL has ?code=...
 * - Implicit: tokens in URL hash #access_token=...
 * Supabase JS will pick up either when we call exchangeCodeForSession(fullURL),
 * and for implicit it can also populate session on init/onAuthStateChange.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const [msg, setMsg] = useState("Finishing sign-in…");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const supabase = supabaseBrowser();
      const url = new URL(window.location.href);
      const hasCode = !!url.searchParams.get("code");

      // 1) Try the unified helper first (covers PKCE and many implicit cases)
      try {
        const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href);
        if (!cancelled && !error && data?.session) {
          setMsg("Signed in. Redirecting…");
          router.replace("/me");
          return;
        }
      } catch {
        // ignore; we'll fall back to implicit handling below
      }

      // 2) For implicit flow, Supabase sets session on init; check and/or wait a moment
      const check = async () => {
        const { data } = await supabase.auth.getSession();
        return data.session ?? null;
      };

      // quick try
      let session = await check();
      if (session && !cancelled) {
        setMsg("Signed in. Redirecting…");
        router.replace("/me");
        return;
      }

      // listen briefly for auth change (e.g., implicit processes hash)
      const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
        if (cancelled) return;
        if (s) {
          setMsg("Signed in. Redirecting…");
          router.replace("/me");
        }
      });

      // also poll once more after a short delay as a safety net
      setTimeout(async () => {
        if (cancelled) return;
        session = await check();
        if (session) {
          setMsg("Signed in. Redirecting…");
          router.replace("/me");
        } else {
          setMsg(
            hasCode
              ? "Could not complete PKCE login. Please try again."
              : "Could not read OAuth response. Please try again."
          );
          setTimeout(() => router.replace("/sign-in"), 1200);
        }
      }, 600);

      return () => {
        sub.subscription.unsubscribe();
      };
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">Auth</h1>
      <p>{msg}</p>
    </main>
  );
}
