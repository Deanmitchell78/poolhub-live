"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";

type ProfileRow = {
  id: string;
  full_name: string | null;
  handle: string | null;
  avatar_url: string | null;
};

export default function LeftColumn({ me }: { me: string | null }) {
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [users, setUsers] = useState<ProfileRow[]>([]);
  const [following, setFollowing] = useState<Set<string>>(new Set());

  // lazy import to avoid ssr bundle pulling your client lib globally
  const supa = async () => (await import("@/lib/supabase-browser")).supabaseBrowser();

  const canFollow = !!me;

  const loadFollowing = useCallback(async () => {
    if (!me) { setFollowing(new Set()); return; }
    const supabase = await supa();
    const { data, error } = await supabase
      .from("follows")
      .select("followee_id")
      .eq("follower_id", me)
      .limit(1000);
    if (!error && Array.isArray(data)) {
      setFollowing(new Set(data.map(r => r.followee_id)));
    }
  }, [me]);

  const loadUsers = useCallback(async () => {
    setBusy(true);
    setErr(null);
    try {
      const supabase = await supa();
      let query = supabase
        .from("profiles")
        .select("id, full_name, handle, avatar_url")
        .order("full_name", { ascending: true, nullsFirst: false })
        .limit(30);

      if (q.trim()) {
        const term = `%${q.trim()}%`;
        query = query.or(`full_name.ilike.${term},handle.ilike.${term}`);
      }
      if (me) query = query.neq("id", me);

      const { data, error } = await query;
      if (error) throw error;
      setUsers((data as any) ?? []);
    } catch (e: any) {
      setErr(e?.message || String(e));
    } finally {
      setBusy(false);
    }
  }, [q, me]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    loadFollowing();
    supa().then((supabase) => {
      const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
        if (!session?.user?.id) setFollowing(new Set());
        else loadFollowing();
      });
      return () => sub.subscription.unsubscribe();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadFollowing]);

  const onFollow = useCallback(async (targetId: string) => {
    if (!me) return;
    const supabase = await supa();
    const { error } = await supabase.from("follows").insert([{ follower_id: me, followee_id: targetId }]);
    if (!error) setFollowing(prev => new Set(prev).add(targetId));
  }, [me]);

  const onUnfollow = useCallback(async (targetId: string) => {
    if (!me) return;
    const supabase = await supa();
    const { error } = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", me)
      .eq("followee_id", targetId);
    if (!error) {
      setFollowing(prev => {
        const nxt = new Set(prev);
        nxt.delete(targetId);
        return nxt;
      });
    }
  }, [me]);

  const list = useMemo(() => users, [users]);

  return (
    <aside className="sticky top-4 space-y-4">
      {/* Site nav */}
      <nav className="rounded-2xl border p-3">
        <div className="font-semibold mb-2">Menu</div>
        <ul className="space-y-1 text-sm">
          <li><Link className="underline" href="/feed">Feed</Link></li>
          <li><Link className="underline" href="/live">Live</Link></li>
          <li><Link className="underline" href="/events">Events</Link></li>
          <li><Link className="underline" href="/tournaments">Tournaments</Link></li>
          <li><Link className="underline" href="/leagues">Leagues</Link></li>
        </ul>
      </nav>

      {/* User directory */}
      <div className="rounded-2xl border">
        <div className="px-3 py-2 font-semibold border-b">Find players</div>
        <div className="p-3 space-y-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") loadUsers(); }}
            placeholder="Search name or @handle"
            className="w-full border rounded-xl px-3 py-2"
          />
          <div className="flex items-center justify-between">
            <button
              onClick={loadUsers}
              className="rounded-xl border px-3 py-1.5 text-sm"
              disabled={busy}
            >
              {busy ? "Searching…" : "Search"}
            </button>
            {err ? <span className="text-xs text-red-600 truncate">{err}</span> : null}
          </div>
        </div>

        {list.length === 0 ? (
          <div className="px-3 pb-3 text-sm text-gray-600">No users found.</div>
        ) : (
          <ul className="divide-y">
            {list.map((u) => {
              const isFollowing = following.has(u.id);
              return (
                <li key={u.id} className="px-3 py-2 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-100 shrink-0">
                    {u.avatar_url ? (
                      <Image
                        src={u.avatar_url}
                        alt={u.full_name ?? "avatar"}
                        width={36}
                        height={36}
                        className="w-9 h-9 object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">
                      {u.full_name || "Unknown"}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {u.handle ? <Link href={`/u/${u.handle}`}>@{u.handle}</Link> : <span className="italic text-gray-400">no handle</span>}
                    </div>
                  </div>
                  {canFollow ? (
                    isFollowing ? (
                      <button
                        onClick={() => onUnfollow(u.id)}
                        className="text-xs rounded-xl border px-2 py-1"
                        aria-label={`Unfollow ${u.full_name || u.handle || "user"}`}
                      >
                        Following
                      </button>
                    ) : (
                      <button
                        onClick={() => onFollow(u.id)}
                        className="text-xs rounded-xl border px-2 py-1"
                        aria-label={`Follow ${u.full_name || u.handle || "user"}`}
                      >
                        Follow
                      </button>
                    )
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}
