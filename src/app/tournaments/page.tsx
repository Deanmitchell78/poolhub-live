export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import TournamentCreateForm from "@/components/TournamentCreateForm";

export default async function TournamentsPage() {
  const supabase = supabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  if (!user) {
    redirect("/sign-in");
  }

  const nowIso = new Date().toISOString();

  // Fetch yours
  const { data: myTournaments } = await supabase
    .from("tournaments")
    .select(
      "id, name, slug, description, starts_at, city, format, entry_fee_cents, created_at"
    )
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  // Fetch upcoming
  const { data: recent } = await supabase
    .from("tournaments")
    .select(
      "id, name, slug, description, starts_at, city, format, entry_fee_cents, created_at"
    )
    .gte("starts_at", nowIso)
    .order("starts_at", { ascending: true })
    .limit(25);

  function dollars(cents: number | null | undefined) {
    if (cents == null) return null;
    return `$${(cents / 100).toFixed(2)}`;
  }

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Tournaments</h1>
        <p className="text-gray-700">
          Signed in as <span className="font-semibold">{user.email}</span>.
        </p>
      </header>

      {/* Create form */}
      <TournamentCreateForm ownerId={user.id} />

      {/* Your tournaments */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Your tournaments</h2>
        {!myTournaments || myTournaments.length === 0 ? (
          <p className="text-gray-600">You haven’t created any tournaments yet.</p>
        ) : (
          <ul className="space-y-2">
            {myTournaments.map((t) => (
              <li key={t.id} className="border rounded p-3">
                <div className="flex items-center justify-between">
                  <a href={`/tournaments/${t.slug}`} className="font-medium underline">
                    {t.name}
                  </a>
                  <span className="text-xs text-gray-500">
                    {t.starts_at ? new Date(t.starts_at).toLocaleString() : "TBD"}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {t.city ? `${t.city} • ` : ""}
                  {t.format ?? "format tbd"}
                  {t.entry_fee_cents != null ? ` • ${dollars(t.entry_fee_cents)}` : ""}
                </p>
                {t.description && <p className="text-gray-800 mt-1">{t.description}</p>}
                <p className="text-xs text-gray-500 mt-1">/{t.slug}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Upcoming / recent tournaments */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Upcoming</h2>
        {!recent || recent.length === 0 ? (
          <p className="text-gray-600">No upcoming tournaments yet.</p>
        ) : (
          <ul className="space-y-2">
            {recent.map((t) => (
              <li key={t.id} className="border rounded p-3">
                <div className="flex items-center justify-between">
                  <a href={`/tournaments/${t.slug}`} className="font-medium underline">
                    {t.name}
                  </a>
                  <span className="text-xs text-gray-500">
                    {t.starts_at ? new Date(t.starts_at).toLocaleString() : "TBD"}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {t.city ? `${t.city} • ` : ""}
                  {t.format ?? "format tbd"}
                  {t.entry_fee_cents != null ? ` • ${dollars(t.entry_fee_cents)}` : ""}
                </p>
                {t.description && <p className="text-gray-800 mt-1">{t.description}</p>}
                <p className="text-xs text-gray-500 mt-1">/{t.slug}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
