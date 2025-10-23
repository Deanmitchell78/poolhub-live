"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function SignInPage() {
  const router = useRouter();
  const params = useSearchParams();
  const redirectTo = params.get("redirect") || "/feed";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const supabase = supabaseBrowser();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
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
      {/* Page header / brand */}
      <div className="mb-6 text-center">
        <div className="inline-block rounded-2xl bg-gradient-to-r from-sky-500/20 via-fuchsia-500/20 to-violet-500/20 px-4 py-2 border shadow-sm">
          <span className="text-sm font-medium tracking-wide text-gray-800">
            PoolHub Live
          </span>
        </div>
        <h1 className="mt-3 text-2xl font-bold">Sign in</h1>
        <p className="mt-1 text-sm text-gray-600">
          Welcome back! Enter your credentials to continue.
        </p>
      </div>

      {/* Card */}
      <div className="rounded-2xl border shadow-sm bg-white overflow-hidden">
        {/* Decorative bar */}
        <div className="h-1 bg-gradient-to-r from-sky-500 via-fuchsia-500 to-violet-500" />

        <form onSubmit={onSignIn} className="p-5 space-y-4">
          {err ? (
            <div className="rounded-xl p-3 bg-red-50 border border-red-200 text-red-700 text-sm">
              {err}
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
            <div className="flex">
              <input
                type={showPwd ? "text" : "password"}
                required
                className="w-full border rounded-l-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPwd((s) => !s)}
                className="border border-l-0 rounded-r-xl px-3 text-sm text-gray-600 hover:bg-gray-50"
                aria-label="Toggle password visibility"
              >
                {showPwd ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">
              <Link className="underline" href="/reset-password">
                Forgot password?
              </Link>
            </span>
            <span className="text-gray-500">
              New here?{" "}
              <Link
                className="underline"
                href={`/sign-up?redirect=${encodeURIComponent(redirectTo)}`}
              >
                Create account
              </Link>
            </span>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl border bg-white px-4 py-2 font-medium shadow hover:shadow-md transition disabled:opacity-60"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>

      {/* Small footnote */}
      <p className="mt-4 text-center text-xs text-gray-500">
        By continuing, you agree to our terms & community rules.
      </p>
    </main>
  );
}
