"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

type Out = Record<string, unknown>;

export default function AuthLab() {
  const [out, setOut] = useState<Out>({});

  async function refresh() {
    const supabase = supabaseBrowser(); // <-- instantiate
    const { data: { user }, error } = await supabase.auth.getUser();
    setOut((o) => ({ ...o, getUser: { user, error: error?.message ?? null } }));
  }

  async function session() {
    const supabase = supabaseBrowser();
    const { data, error } = await supabase.auth.getSession();
    setOut((o) => ({ ...o, getSession: { session: data.session, error: error?.message ?? null } }));
  }

  async function signOut() {
    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.signOut();
    setOut((o) => ({ ...o, signOut: { ok: !error, error: error?.message ?? null } }));
  }

  return (
    <main className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Auth Lab</h1>
      <div className="flex gap-2 flex-wrap">
        <button onClick={refresh} className="rounded-xl border px-3 py-1.5 text-sm">getUser()</button>
        <button onClick={session} className="rounded-xl border px-3 py-1.5 text-sm">getSession()</button>
        <button onClick={signOut} className="rounded-xl border px-3 py-1.5 text-sm">signOut()</button>
      </div>
      <pre className="rounded-xl border p-3 text-xs overflow-auto bg-gray-50">
        {JSON.stringify(out, null, 2)}
      </pre>
    </main>
  );
}
