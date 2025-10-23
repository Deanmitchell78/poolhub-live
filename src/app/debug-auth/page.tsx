"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function DebugAuthPage() {
  const [state, setState] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const { data: { user }, error } = await supabaseBrowser.auth.getUser();
      setState({ url, hasKey, user, error: error?.message || null });
      console.log("debug-auth", { url, hasKey, user, error });
    })();
  }, []);

  return (
    <main className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Auth Debug</h1>
      <pre className="whitespace-pre-wrap rounded-xl border p-4 text-sm">
        {JSON.stringify(state, null, 2)}
      </pre>
      <p className="text-xs text-gray-500">
        If <code>user</code> is null, sign in at <a className="underline" href="/(auth)/sign-in">/(auth)/sign-in</a> on this same URL.
      </p>
    </main>
  );
}
