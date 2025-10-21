"use client";

import { supabaseBrowser } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    await supabaseBrowser().auth.signOut();
    router.replace("/sign-in");
  }

  return (
    <button
      onClick={handleSignOut}
      className="mt-4 px-4 py-2 rounded bg-black text-white"
    >
      Sign out
    </button>
  );
}
