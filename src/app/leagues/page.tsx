export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { supabaseServer } from "../../lib/supabase-server";
import LeagueCreateForm from "@/components/LeagueCreateForm";

export default async function LeaguesPage() {
  const supabase = supabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  if (!user) {
    redirect("/sign-in");
  }

  // Fetch leagues: yours + all (public read by policy)
  const [{ data: myLeagues }, { data: allLeagues }] = await Promise.all([
    supabase
      .from("leagues")
      .select("id, name, slug, description, created_at")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("leagues")
      .select("id, name, slug, description, created_at")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Leagues</h1>
        <p className="text-gray-700">
          Signed in as <span className="font-semibold">{user.email}</span>.
        </p>
      </header>

      {/* Create form */}
      <LeagueCreateForm ownerId={user.id} />

      {/* Your leagues */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Your leagues</h2>
        {(!myLeagues || myLeagues.length === 0) ? (
          <p className="text-gray-600">You haven’t created any leagues yet.</p>
        ) : (
          <ul className="space-y-2">
            {myLeagues.map((l) => (
              <li key={l.id} className="border rounded p-3">
                <div className="flex items-center justify-between">
                  <a href={`/leagues/${l.slug}`} className="font-medium underline">
                    {l.name}
                  </a>
                  <span className="text-xs text-gray-500">
                    {new Date(l.created_at).toLocaleDateString()}
                  </span>
                </div>
                {l.description && (
                  <p className="text-gray-700 mt-1">{l.description}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">/{l.slug}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* All leagues (public) */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">All leagues</h2>
        {(!allLeagues || allLeagues.length === 0) ? (
          <p className="text-gray-600">No leagues yet.</p>
        ) : (
          <ul className="space-y-2">
            {allLeagues.map((l) => (
              <li key={l.id} className="border rounded p-3">
                <a href={`/leagues/${l.slug}`} className="font-medium underline">
                  {l.name}
                </a>
                {l.description && (
                  <p className="text-gray-700 mt-1">{l.description}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">/{l.slug}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
