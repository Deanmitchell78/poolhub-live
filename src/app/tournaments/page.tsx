export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "../../lib/supabase-server";
import TournamentCreateForm from "@/components/TournamentCreateForm";

type Row = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  starts_at: string | null;
  city: string | null;
  format: string | null;
  entry_fee_cents: number | null;
  created_at: string;
  is_published: boolean | null;
};

export default async function TournamentsPage() {
  const supabase = supabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  if (!user) {
    redirect("/sign-in");
  }

  // Fetch tournaments: yours + recent/upcoming (public or yours if draft)
  const nowIso = new Date().toISOString();
  const [{ data: myTournaments }, { data: recent }] = await Promise.all([
    supabase
      .from("tournaments")
      .select(
        "id, name, slug, description, starts_at, city, format, entry_fee_cents, created_at, is_published"
      )
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false }) as Promise<{ data: Row[] | null; error: any }>,

    supabase
      .from("tournaments")
      .select(
        "id, name, slug, description, starts_at, city, format, entry_fee_cents, created_at, is_published"
      )
      .gte("starts_at", nowIso)
      .order("starts_at", { ascending: true })
      .limit(25) as Promise<{ data: Row[] | null; error: any }>,
  ]);

  function dollars(cents: number | null | undefined) {
    if (cents == null) return null;
    return `$${(cents / 100).toFixed(2)}`;
  }

  function Badge({ published }: { published: boolean | null }) {
    const isPub = !!published;
    return (
      <span
        className={`text-xs px-2 py-0.5 rounded-full border
        ${isPub ? "border-green-500 text-green-600" : "border-amber-500 text-amber-600"}`}
        title={isPub ? "Visible to everyone" : "Visible to you (draft)"}
      >
        {isPub ? "Public" : "Draft"}
      </span>
    );
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
        {(!myTournaments || myTournaments.length === 0) ? (
          <p className="text-gray-600">You haven’t created any tournaments yet.</p>
        ) : (
          <ul className="space-y-2">
            {myTournaments.map((t) => (
              <li key={t.id} className="border rounded p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Link href={`/tournaments/${t.slug}`} className="font-medium underline">
                      {t.name}
                    </Link>
                    <Badge published={t.is_published} />
                  </div>
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

                <p className="text-xs text-gray-500 mt-1">/tournaments/{t.slug}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Upcoming / recent tournaments */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Upcoming</h2>
        {(!recent || recent.length === 0) ? (
          <p className="text-gray-600">No upcoming tournaments yet.</p>
        ) : (
          <ul className="space-y-2">
            {recent.map((t) => (
              <li key={t.id} className="border rounded p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Link href={`/tournaments/${t.slug}`} className="font-medium underline">
                      {t.name}
                    </Link>
                    <Badge published={t.is_published} />
                  </div>
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

                <p className="text-xs text-gray-500 mt-1">/tournaments/{t.slug}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
