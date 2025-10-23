export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { supabaseServer } from "@/lib/supabase-server";
import TournamentCreateForm from "@/components/TournamentCreateForm";

export default async function NewTournamentPage() {
  const supabase = supabaseServer();
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const { data: { user } } = await (await supabase).auth.getUser();
  if (!user) {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <div className="rounded-2xl border bg-white shadow-sm p-6">
          <p className="mb-3">Please sign in to create a tournament.</p>
          <a className="rounded-2xl px-4 py-2 border shadow bg-black text-white" href="/sign-in">Sign in</a>
        </div>
      </main>
    );
  }

  const { data: profile } = await (await supabase)
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .maybeSingle();
  const plan = profile?.plan ?? "free";

  if (!(plan === "pro" || plan === "td")) {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <div className="rounded-2xl border bg-white shadow-sm p-6 space-y-3">
          <h1 className="text-xl font-semibold">Upgrade required</h1>
          <p>Creating tournaments is available on <strong>Pro ($9.99/mo)</strong> and <strong>Tournament Director ($29.99/mo)</strong> plans.</p>
          <a className="rounded-2xl px-4 py-2 border shadow bg-black text-white" href="/settings?upgrade=pro">
            View plans
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Create a Tournament</h1>
      </header>
      <div className="rounded-2xl border bg-white shadow-sm p-6">
        <TournamentCreateForm ownerId={user.id} />
      </div>
    </main>
  );
}
