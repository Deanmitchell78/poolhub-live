export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { supabaseServer } from "../../../lib/supabase-server";

type PageProps = { params: { slug: string } };

export default async function LeagueDetailPage({ params }: PageProps) {
  const supabase = supabaseServer();

  const { data: league } = await supabase
    .from("leagues")
    .select("id, name, slug, description, created_at")
    .eq("slug", params.slug)
    .maybeSingle();

  if (!league) {
    notFound();
  }

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-3xl font-bold">{league.name}</h1>
      <p className="text-gray-600">/{league.slug}</p>

      {league.description && (
        <p className="text-gray-800">{league.description}</p>
      )}

      <p className="text-sm text-gray-500">
        Created {new Date(league.created_at).toLocaleString()}
      </p>

      <div className="pt-4">
        <a href="/leagues" className="underline">← Back to leagues</a>
      </div>
    </main>
  );
}
