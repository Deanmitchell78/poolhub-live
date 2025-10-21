"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

/**
 * Supabase-based auth gate.
 * - While checking: shows a lightweight message
 * - If not signed in: redirects to /sign-in
 * - If signed in: renders children
 */
export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = supabaseBrowser();
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;

      if (!data.session) {
        router.replace("/sign-in");
      } else {
        setChecking(false);
      }

      // also listen briefly in case session restores after mount
      const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
        if (cancelled) return;
        if (session) setChecking(false);
        else router.replace("/sign-in");
      });
      return () => sub.subscription.unsubscribe();
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (checking) {
    return <p className="text-gray-600">Checking your session…</p>;
  }

  return <>{children}</>;
}
