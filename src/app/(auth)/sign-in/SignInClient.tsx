"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function SignInClient() {
  const [email, setEmail] = useState("");
  const [status, setStatus] =
    useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setMessage("");

    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/callback`,
      },
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
    } else {
      setStatus("sent");
      setMessage("Check your email for the sign-in link.");
    }
  }

  async function handleGoogle() {
    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/callback`,
        // flowType removed for compatibility with your supabase-js version
        queryParams: { prompt: "select_account" },
      },
    });
    if (error) {
      setStatus("error");
      setMessage(error.message);
    }
  }

  return (
    <main className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Sign in</h1>

      {/* Magic link form */}
      <form onSubmit={handleEmail} className="space-y-3">
        <label className="block">
          <span className="block mb-1">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="you@example.com"
          />
        </label>

        <button
          type="submit"
          disabled={status === "sending"}
          className="px-4 py-2 rounded bg-black text-white"
        >
          {status === "sending" ? "Sending..." : "Send magic link"}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px" />
        <span className="text-sm text-gray-500">or</span>
        <div className="flex-1 h-px" />
      </div>

      {/* Google button */}
      <button
        onClick={handleGoogle}
        className="w-full px-4 py-2 rounded border"
        aria-label="Sign in with Google"
      >
        Continue with Google
      </button>

      {message && (
        <p className={status === "error" ? "text-red-600" : "text-green-700"}>
          {message}
        </p>
      )}

      <a className="underline" href="/">
        Back to home
      </a>
    </main>
  );
}
