export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import SocialShare from "@/components/SocialShare";

export default async function LeaguePage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = await supabaseServer();

  const { data: league, error } = await supabase
    .from("leagues")
    .select("id, name, slug, description, created_at")
    .eq("slug", params.slug)
    .maybeSingle();

  if (error || !league) return notFound();

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">{league.name}</h1>
        <p className="text-xs text-gray-500">
          Created {new Date(league.created_at).toLocaleString()}
        </p>
      </header>

      {league.description && (
        <p className="text-gray-800">{league.description}</p>
      )}

      <SocialShare
        title={`Check out the ${league.name} league`}
        url={`/leagues/${league.slug}`}
      />
    </main>
  );
}
