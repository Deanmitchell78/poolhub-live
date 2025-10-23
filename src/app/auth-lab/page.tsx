"use client";

import React, { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function AuthLab() {
  const [out, setOut] = useState<any>({});

  async function refresh() {
    const { data: { user }, error } = await supabaseBrowser.auth.getUser();
    setOut((o: any) => ({ ...o, getUser: { user, error: error?.message || null } }));
  }

  useEffect(() => { refresh(); }, []);

  return (
    <main className="max-w-xl mx-auto p-6 space-y-3">
      <h1 className="text-2xl font-bold">Auth Lab</h1>

      <div className="flex gap-2 flex-wrap">
        <button className="border rounded px-3 py-2" onClick={refresh}>getUser()</button>

        <button
          className="border rounded px-3 py-2"
          onClick={async () => {
            const email = prompt("Email?");
            const password = prompt("Password?");
            const res = await supabaseBrowser.auth.signInWithPassword({ email: email || "", password: password || "" });
            setOut((o: any) => ({ ...o, signInWithPassword: { data: res.data, error: res.error?.message || null } }));
            await refresh();
          }}
        >
          signInWithPassword()
        </button>

        <button
          className="border rounded px-3 py-2"
          onClick={async () => {
            const email = prompt("New email?");
            const password = prompt("New password?");
            const res = await supabaseBrowser.auth.signUp({
              email: email || "",
              password: password || "",
            });
            setOut((o: any) => ({ ...o, signUp: { data: res.data, error: res.error?.message || null } }));
            await refresh();
          }}
        >
          signUp()
        </button>

        <button
          className="border rounded px-3 py-2"
          onClick={async () => {
            const res = await supabaseBrowser.auth.signOut();
            setOut((o: any) => ({ ...o, signOut: { error: res.error?.message || null } }));
            await refresh();
          }}
        >
          signOut()
        </button>

        <button
          className="border rounded px-3 py-2"
          onClick={() => {
            // Inspect localStorage token (persisted session)
            const keys = Object.keys(localStorage);
            const authKeys = keys.filter(k => k.includes("-auth-token"));
            const dump = Object.fromEntries(authKeys.map(k => [k, localStorage.getItem(k)]));
            setOut((o: any) => ({ ...o, localStorage: dump }));
          }}
        >
          Inspect localStorage
        </button>

        <button
          className="border rounded px-3 py-2"
          onClick={() => {
            // Clear only supabase auth tokens
            Object.keys(localStorage)
              .filter(k => k.includes("-auth-token"))
              .forEach(k => localStorage.removeItem(k));
            setOut((o: any) => ({ ...o, localStorageCleared: true }));
          }}
        >
          Clear auth tokens
        </button>
      </div>

      <pre className="border rounded p-3 text-sm whitespace-pre-wrap">
        {JSON.stringify(out, null, 2)}
      </pre>

      <div className="text-xs text-gray-500">
        URL: {process.env.NEXT_PUBLIC_SUPABASE_URL} · Key: {String(!!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)}
      </div>
    </main>
  );
}
