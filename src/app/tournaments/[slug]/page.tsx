export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import DeleteButton from "@/components/DeleteButton";
import SocialShare from "@/components/SocialShare";

export default async function TournamentDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = await supabaseServer();

  const { data: t, error } = await supabase
    .from("tournaments")
    .select(
      "id, name, slug, description, starts_at, city, format, entry_fee_cents, owner_id, created_at"
    )
    .eq("slug", params.slug)
    .single();

  if (error || !t) return notFound();

  const dollars = (cents: number | null | undefined) =>
    cents == null ? null : `$${(cents / 100).toFixed(2)}`;

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">{t.name}</h1>
        <p className="text-gray-600">
          {t.city ? `${t.city} • ` : ""}
          {t.format ?? "format tbd"}
          {t.entry_fee_cents != null ? ` • ${dollars(t.entry_fee_cents)}` : ""}
        </p>
        {t.starts_at && (
          <p className="text-sm text-gray-500">
            {new Date(t.starts_at).toLocaleString()}
          </p>
        )}
      </header>

      {t.description && <p className="text-gray-800">{t.description}</p>}

      <SocialShare
        title={`Check out this tournament: ${t.name}`}
        url={`/tournaments/${t.slug}`}
      />

      <DeleteButton
        label="Delete tournament"
        action={`/api/tournaments/${t.id}/delete`}
      />
    </main>
  );
}
