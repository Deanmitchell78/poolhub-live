import { supabaseServer } from "@/lib/supabase-server";
import Link from "next/link";

export default async function PublicProfilePage({
  params,
}: {
  params: { handle: string };
}) {
  const supabase = supabaseServer();

  const { data: prof, error } = await supabase
    .from("profiles")
    .select("id, full_name, handle, about, shaft")
    .eq("handle", params.handle)
    .maybeSingle();

  if (error || !prof) {
    return (
      <main className="max-w-xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-3">Profile</h1>
        <p className="text-gray-600 mb-4">This user was not found.</p>
        <Link className="underline" href="/feed">
          Go to feed
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-xl mx-auto p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold">
          {prof.full_name || `@${prof.handle}`}
        </h1>
        {prof.handle ? (
          <div className="text-gray-500">@{prof.handle}</div>
        ) : null}
      </header>

      <section>
        <h2 className="text-lg font-semibold mb-2">About me</h2>
        {prof.about ? (
          <p className="whitespace-pre-wrap">{prof.about}</p>
        ) : (
          <p className="italic text-gray-500">No bio yet.</p>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">Equipment</h2>
        <dl className="grid grid-cols-3 gap-x-4 gap-y-1">
          <dt className="text-gray-500">Shaft</dt>
          <dd className="col-span-2">
            {prof.shaft ? prof.shaft : <span className="italic text-gray-400">—</span>}
          </dd>
        </dl>
      </section>
    </main>
  );
}
