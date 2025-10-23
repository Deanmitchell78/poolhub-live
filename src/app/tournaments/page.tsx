export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { supabaseServer } from "@/lib/supabase-server";

type Row = {
  id: string;
  name: string | null;
  slug: string | null;
  starts_at: string | null;
  city: string | null;
  entry_fee_cents: number | null;
};

function fmtWhen(iso: string | null) {
  if (!iso) return "TBD";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "TBD" : d.toLocaleString();
}

function fmtMoney(cents: number | null) {
  if (cents == null) return "";
  const dollars = (cents / 100).toFixed(2);
  return `$${dollars}`;
}

export default async function TournamentsPage() {
  // ✅ MUST await — Next 15 cookies() are async, so supabaseServer() is async
  const supabase = await supabaseServer();

  const nowIso = new Date().toISOString();
  const { data: rows, error } = await supabase
    .from("tournaments")
    .select("id, name, slug, starts_at, city, entry_fee_cents")
    .gte("starts_at", nowIso)
    .order("starts_at", { ascending: true })
    .limit(100);

  const list = Array.isArray(rows) ? (rows as Row[]) : [];
  const errMsg = error?.message ?? null;

  return (
    <main className="space-y-6">
      <div className="rounded-2xl p-6 bg-gradient-to-r from-sky-500/20 via-fuchsia-500/20 to-violet-500/20 border shadow-sm">
        <h1 className="text-2xl font-bold">Tournaments</h1>
        <p className="text-gray-700">Browse upcoming tournaments.</p>
      </div>

      {errMsg ? (
        <div className="rounded-xl p-4 bg-red-50 border border-red-200 text-red-700">
          Failed to load tournaments: {errMsg}
        </div>
      ) : list.length === 0 ? (
        <p className="text-gray-600">No upcoming tournaments.</p>
      ) : (
        <ul className="divide-y rounded-2xl border shadow-sm bg-white">
          {list.map((t) => (
            <li key={t.id} className="p-4 flex items-center justify-between">
              <div className="min-w-0">
                <div className="font-medium truncate">{t.name ?? "Tournament"}</div>
                <div className="text-sm text-gray-600">
                  {fmtWhen(t.starts_at)}
                  {t.city ? ` • ${t.city}` : ""}
                  {t.entry_fee_cents != null ? ` • ${fmtMoney(t.entry_fee_cents)} entry` : ""}
                </div>
              </div>
              <a
                href={t.slug ? `/tournaments/${t.slug}` : `/tournaments/${t.id}`}
                className="text-sm rounded-2xl px-3 py-1 border shadow bg-white"
              >
                Open
              </a>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
