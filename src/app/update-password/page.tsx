"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  // Ensure we have a recovery session (Supabase sets this when user clicks the reset link)
  useEffect(() => {
    const supabase = supabaseBrowser();
    supabase.auth.getSession().then(({ data }) => {
      setReady(!!data.session);
    });
  }, []);

  const onUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    if (password !== confirm) {
      setErr("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const supabase = supabaseBrowser();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setMsg("Password updated. Redirecting…");
      setTimeout(() => {
        router.replace("/sign-in");
        router.refresh();
      }, 900);
    } catch (e: any) {
      setErr(e?.message || String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <div className="mb-6 text-center">
        <div className="inline-block rounded-2xl bg-gradient-to-r from-sky-500/20 via-fuchsia-500/20 to-violet-500/20 px-4 py-2 border shadow-sm">
          <span className="text-sm font-medium tracking-wide text-gray-800">
            PoolHub Live
          </span>
        </div>
        <h1 className="mt-3 text-2xl font-bold">Set new password</h1>
        <p className="mt-1 text-sm text-gray-600">
          Create a strong password to secure your account.
        </p>
      </div>

      <div className="rounded-2xl border shadow-sm bg-white overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-sky-500 via-fuchsia-500 to-violet-500" />

        <div className="p-5 space-y-4">
          {!ready ? (
            <div className="text-gray-600">Checking reset session…</div>
          ) : (
            <form onSubmit={onUpdate} className="space-y-4">
              {err ? (
                <div className="rounded-xl p-3 bg-red-50 border border-red-200 text-red-700 text-sm">
                  {err}
                </div>
              ) : null}
              {msg ? (
                <div className="rounded-xl p-3 bg-green-50 border border-green-200 text-green-700 text-sm">
                  {msg}
                </div>
              ) : null}

              <div className="space-y-1.5">
                <label className="block text-sm font-medium">New password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium">Confirm new password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-xl border bg-white px-4 py-2 font-medium shadow hover:shadow-md transition disabled:opacity-60"
              >
                {busy ? "Updating…" : "Update password"}
              </button>
            </form>
          )}
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-gray-500">
        If this page doesn’t recognize your reset link, try opening it in the same browser/device you requested it from.
      </p>
    </main>
  );
}
