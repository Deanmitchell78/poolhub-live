"use client";

import React, { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

type SessionUser = { id: string; email?: string | null };

export default function HeaderAuthControls() {
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    let mounted = true;

    // Initial load
    supabaseBrowser.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      const u = data?.user;
      setUser(u ? { id: u.id, email: u.email } : null);
    });

    // Subscribe to auth changes
    const { data: sub } = supabaseBrowser.auth.onAuthStateChange((_evt, session) => {
      if (!mounted) return;
      const u = session?.user;
      setUser(u ? { id: u.id, email: u.email } : null);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm">{user.email}</span>
        <button
          className="text-sm border rounded-xl px-3 py-1"
          onClick={async () => {
            await supabaseBrowser.auth.signOut();
            window.location.replace("/(auth)/sign-in");
          }}
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <a className="text-sm border rounded-xl px-3 py-1" href="/(auth)/sign-in">
      Sign in
    </a>
  );
}
