export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { supabaseServer } from "../lib/supabase-server";

export default async function HomePage() {
  const supabase = supabaseServer();
  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  return (
    <main className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-3xl font-bold mb-2">PoolHub Live</h1>
      <p className="text-gray-700">
        Welcome — use the button below to {user ? "view your account" : "sign in"}.
      </p>

      <div className="space-x-4">
        {user ? (
          <a href="/me" className="px-4 py-2 bg-black text-white rounded">Account</a>
        ) : (
          <a href="/sign-in" className="px-4 py-2 bg-black text-white rounded">Sign In</a>
        )}
        <a href="/profile" className="px-4 py-2 border rounded">Profile (redirects to /me)</a>
      </div>
    </main>
  );
}
