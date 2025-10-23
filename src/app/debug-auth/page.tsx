"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

type DebugState = {
  url: string | undefined;
  hasKey: boolean;
  user: unknown;
  error: string | null;
};

export default function DebugAuthPage() {
  const [state, setState] = useState<DebugState>({
    url: undefined,
    hasKey: false,
    user: null,
    error: null,
  });

  useEffect(() => {
    (async () => {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const supabase = supabaseBrowser(); // <-- instantiate
      const { data: { user }, error } = await supabase.auth.getUser();

      setState({ url, hasKey, user, error: error?.message ?? null });
      // eslint-disable-next-line no-console
      console.log("debug-auth", { url, hasKey, user, error });
    })();
  }, []);

  return (
    <main className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Debug Auth</h1>
      <div className="rounded-2xl border p-4 text-sm bg-white shadow-sm">
        <div><span className="font-medium">NEXT_PUBLIC_SUPABASE_URL:</span> {String(state.url)}</div>
        <div><span className="font-medium">Has anon key:</span> {String(state.hasKey)}</div>
        <div><span className="font-medium">User present:</span> {state.user ? "yes" : "no"}</div>
        {state.error ? (
          <div className="mt-2 text-red-600">Error: {state.error}</div>
        ) : null}
      </div>
      <pre className="rounded-2xl border p-3 text-xs overflow-auto bg-gray-50">
        {JSON.stringify(state.user, null, 2)}
      </pre>
    </main>
  );
}
