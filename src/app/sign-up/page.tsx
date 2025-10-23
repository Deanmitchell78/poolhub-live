"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function SignUpPage() {
  const router = useRouter();
  const params = useSearchParams();
  const redirectTo = params.get("redirect") || "/feed";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const onSignUp = async (e: React.FormEvent) => {
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
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // If email confirmation is ON in Supabase, it will send a verify link.
          emailRedirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}${redirectTo}`
              : undefined,
        },
      });
      if (error) throw error;

      // If email confirmation is ON, user may not be signed in yet.
      // Show a friendly message but still try to move them along.
      setMsg("Account created. Check your email if confirmation is required.");
      router.replace(redirectTo);
      router.refresh();
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
        <h1 className="mt-3 text-2xl font-bold">Create account</h1>
        <p className="mt-1 text-sm text-gray-600">
          Join the community — it takes less than a minute.
        </p>
      </div>

      <div className="rounded-2xl border shadow-sm bg-white overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-sky-500 via-fuchsia-500 to-violet-500" />

        <form onSubmit={onSignUp} className="p-5 space-y-4">
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
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              required
              className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value.trim())}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Password</label>
            <input
              type="password"
              required
              minLength={6}
              className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Confirm password</label>
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
            {busy ? "Creating…" : "Create account"}
          </button>

          <div className="text-sm text-right">
            <Link className="underline" href={`/sign-in?redirect=${encodeURIComponent(redirectTo)}`}>
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>

      <p className="mt-4 text-center text-xs text-gray-500">
        By creating an account, you agree to our terms & community rules.
      </p>
    </main>
  );
}
