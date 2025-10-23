"use client";

import React, { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;

    async function check() {
      const { data: { user } } = await supabaseBrowser.auth.getUser();
      if (!mounted) return;
      setAuthed(!!user);
      setReady(true);
      if (!user) {
        // not signed in — go to sign-in
        window.location.replace("/(auth)/sign-in");
      }
    }

    check();

    const { data: sub } = supabaseBrowser.auth.onAuthStateChange((_evt, session) => {
      if (!mounted) return;
      setAuthed(!!session?.user);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (!ready) {
    return <div className="p-4 text-sm text-gray-500">Checking your session…</div>;
  }

  if (!authed) return null; // we just redirected

  return <>{children}</>;
}
