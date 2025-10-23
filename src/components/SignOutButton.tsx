"use client";

import React from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function SignOutButton() {
  return (
    <button
      className="text-sm border rounded-xl px-3 py-1"
      onClick={async () => {
        await supabaseBrowser.auth.signOut();
        window.location.replace("/(auth)/sign-in");
      }}
    >
      Sign out
    </button>
  );
}
