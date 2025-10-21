"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import HeaderSignOutButton from "@/components/HeaderSignOutButton";

export default function HeaderAuthControls() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = supabaseBrowser();

    // initial check
    supabase.auth.getSession().then(({ data }) => {
      setSignedIn(!!data.session);
    });

    // live updates
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      setSignedIn(!!session);
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  // while checking, render nothing to avoid flicker
  if (signedIn === null) return null;

  return signedIn ? (
    <>
      <Link href="/me" className="px-3 py-1.5 rounded bg-black text-white">Account</Link>
      <HeaderSignOutButton />
    </>
  ) : (
    <Link href="/sign-in" className="px-3 py-1.5 rounded bg-black text-white">Sign in</Link>
  );
}
