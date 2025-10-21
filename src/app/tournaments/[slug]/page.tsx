export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import DeleteButton from "@/components/DeleteButton";
import SocialShare from "@/components/SocialShare";

type Tournament = {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  is_published: boolean;
  starts_at: string | null;
  city: string | null;
  format: string | null;
  description: string | null;
  entry_fee_cents: number | null;
  created_at: string;
};

function dollars(cents: number | null | undefined) {
  if (cents == null) return "—";
  return `$${(cents / 100).toFixed(2)}`;
}

async function getData(slug: string) {
  const supabase = supabaseServer();

  // May be null for signed-out visitors
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user ?? null;

  // RLS allows public read of published and owner read of drafts
  const { data, error } = await supabase
    .from("tournaments")
    .select(
      "id,name,slug,owner_id,is_published,starts_at,city,format,description,entry_fee_cents,created_at"
    )
    .eq("slug", slug)
    .single<Tournament>();

  if (error || !data) return { tournament: null, user };
  return { tournament: data, user };
}

export default async function TournamentPage({
  params,
}: {
  params: { slug: string };
}) {
  const { tournament, user } = await getData(params.slug);

  if (!tournament) return notFound();

  const isOwner = user?.id === tournament.owner_id;

  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const shareUrl = `${base}/tournaments/${tournament.slug}`;

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{tournament.name}</h1>
        </div>

        {isOwner && (
          <div className="flex gap-2">
            <Link
              href={`/tournaments/${tournament.slug}/edit`}
              className="px-3 py-2 rounded-xl bg-black text-white text-sm"
            >
              Edit
            </Link>
            <DeleteButton actionUrl={`/api/tournaments/${tournament.id}/delete`} />
          </div>
        )}
      </header>

      {!tournament.is_published && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
          Draft (only visible to you). Set it to <span className="font-semibold">Public</span> to share.
        </p>
      )}

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border p-4">
          <h2 className="font-semibold mb-2">Details</h2>
          <ul className="space-y-1 text-sm">
            <li>
              <span className="text-gray-500">Starts:</span>{" "}
              {tournament.starts_at
                ? new Date(tournament.starts_at).toLocaleString()
                : "TBD"}
            </li>
            <li>
              <span className="text-gray-500">City:</span>{" "}
              {tournament.city ?? "TBD"}
            </li>
            <li>
              <span className="text-gray-500">Format:</span>{" "}
              {tournament.format ?? "—"}
            </li>
            <li>
              <span className="text-gray-500">Entry Fee:</span>{" "}
              {dollars(tournament.entry_fee_cents)}
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border p-4">
          <h2 className="font-semibold mb-2">About</h2>
          <p className="text-sm text-gray-700">
            {tournament.description ?? "No description yet."}
          </p>
        </div>
      </section>

      {/* Share */}
      <SocialShare
        url={shareUrl}
        title={`Join ${tournament.name}`}
        text={`Come play or watch ${tournament.name} on PoolHub`}
      />

      <footer className="pt-2">
        <Link href="/tournaments" className="underline text-sm">
          ← Back to tournaments
        </Link>
      </footer>
    </main>
  );
}
