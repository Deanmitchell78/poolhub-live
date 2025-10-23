"use client";

import { useMemo, useState } from "react";
import AvatarUploader from "@/components/AvatarUploader";

type Props = {
  userId: string;
  initialFullName: string;
  initialHandle: string;

  initialAvatarUrl?: string | null;

  initialLeague?: string | null;
  initialOtherLeague?: string | null;

  initialApaRating?: string | null;
  initialNapaRating?: string | null;
  initialFargoRating?: number | null;

  initialCuePlay?: string | null;
  initialCueBreak?: string | null;
  initialCueJump?: string | null;

  initialCashapp?: string | null;
  initialVenmo?: string | null;

  initialFavoriteGame?: string | null;
};

const LEAGUE_OPTIONS = [
  "APA",
  "NAPA",
  "BCA (BCAPL)",
  "USAPL",
  "ACS",
  "VNEA",
  "Other",
] as const;
type LeagueOption = typeof LEAGUE_OPTIONS[number];

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border shadow-sm bg-white">
      <div className="rounded-t-2xl px-4 py-3 bg-gradient-to-r from-sky-500/10 to-violet-500/10 border-b">
        <h3 className="font-semibold">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

export default function ProfileForm({
  userId,
  initialHandle,
  initialFullName,
  initialAvatarUrl = "",
  initialLeague = "",
  initialOtherLeague = "",
  initialApaRating = "",
  initialNapaRating = "",
  initialFargoRating = null,
  initialCuePlay = "",
  initialCueBreak = "",
  initialCueJump = "",
  initialCashapp = "",
  initialVenmo = "",
  initialFavoriteGame = "",
}: Props) {
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl ?? "");
  const [fullName, setFullName] = useState(initialFullName ?? "");

  const [league, setLeague] = useState<LeagueOption | "">(
    (LEAGUE_OPTIONS.includes((initialLeague as LeagueOption) ?? "") ? (initialLeague as LeagueOption) : "") as LeagueOption | ""
  );
  const [otherLeague, setOtherLeague] = useState(initialOtherLeague ?? "");
  const showOtherLeague = useMemo(() => league === "Other", [league]);

  const [apa, setApa] = useState(String(initialApaRating ?? ""));
  const [napa, setNapa] = useState(String(initialNapaRating ?? ""));
  const [fargo, setFargo] = useState(initialFargoRating != null ? String(initialFargoRating) : "");

  const [cuePlay, setCuePlay] = useState(initialCuePlay ?? "");
  const [cueBreak, setCueBreak] = useState(initialCueBreak ?? "");
  const [cueJump, setCueJump] = useState(initialCueJump ?? "");

  const [cashapp, setCashapp] = useState(initialCashapp ?? "");
  const [venmo, setVenmo] = useState(initialVenmo ?? "");
  const [favoriteGame, setFavoriteGame] = useState(initialFavoriteGame ?? "");

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function saveField(update: Record<string, any>) {
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(update),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);
  }

  async function onAvatarUploaded(url: string) {
    try {
      setMsg(null);
      setErr(null);
      await saveField({ avatar_url: url });
      setAvatarUrl(url);
      setMsg("Photo updated!");
    } catch (e: any) {
      setErr(e.message || "Failed to save photo");
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    setSaving(true);
    try {
      const body: any = {
        full_name: fullName || null,
        league: league || null,
        other_league: showOtherLeague ? (otherLeague || null) : null,
        apa_rating: apa || null,
        napa_rating: napa || null,
        cue_play: cuePlay || null,
        cue_break: cueBreak || null,
        cue_jump: cueJump || null,
        cashapp: cashapp || null,
        venmo: venmo || null,
        favorite_game: favoriteGame || null,
        avatar_url: avatarUrl || null,
      };
      if (fargo.trim() !== "") body.fargo_rating = Number(fargo);

      await saveField(body);
      setMsg("Saved!");
    } catch (e: any) {
      setErr(e.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Top banner */}
      <div className="rounded-2xl p-5 bg-gradient-to-r from-sky-500/20 via-fuchsia-500/20 to-violet-500/20 border shadow-sm">
        <div className="flex items-center gap-6">
          <AvatarUploader userId={userId} initialUrl={avatarUrl} onUploaded={onAvatarUploaded} />
          <div className="flex-1">
            <div className="text-sm text-gray-600 mb-1">Username</div>
            <div className="text-xl font-semibold">@{initialHandle}</div>
            <div className="mt-3">
              <label className="block text-sm font-medium mb-1">Full name</label>
              <input
                className="w-full border rounded-xl px-3 py-2 bg-white"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
              />
            </div>
          </div>
        </div>
      </div>

      {/* League & Ratings */}
      <Card title="League & Ratings">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">League</label>
            <select
              className="w-full border rounded-xl px-3 py-2"
              value={league}
              onChange={(e) => setLeague(e.target.value as LeagueOption | "")}
            >
              <option value="">Select league…</option>
              {LEAGUE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            {showOtherLeague && (
              <input
                className="w-full border rounded-xl px-3 py-2 mt-2"
                placeholder="Type your league name"
                value={otherLeague}
                onChange={(e) => setOtherLeague(e.target.value)}
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Fargo rating</label>
            <input
              className="w-full border rounded-xl px-3 py-2"
              value={fargo}
              onChange={(e) => setFargo(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="200–850"
              inputMode="numeric"
            />
            <p className="text-xs text-gray-500 mt-1">Enter 200–850.</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">APA rating</label>
            <input
              className="w-full border rounded-xl px-3 py-2"
              value={apa}
              onChange={(e) => setApa(e.target.value)}
              placeholder="e.g., 8-ball SL 5 / 9-ball SL 6"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">NAPA rating</label>
            <input
              className="w-full border rounded-xl px-3 py-2"
              value={napa}
              onChange={(e) => setNapa(e.target.value)}
              placeholder="e.g., 7"
            />
          </div>
        </div>
      </Card>

      {/* Equipment */}
      <Card title="Equipment">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Cue</label>
            <input className="w-full border rounded-xl px-3 py-2" value={cuePlay} onChange={(e) => setCuePlay(e.target.value)} placeholder="Playing cue brand/model" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Break cue</label>
            <input className="w-full border rounded-xl px-3 py-2" value={cueBreak} onChange={(e) => setCueBreak(e.target.value)} placeholder="Break cue brand/model" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Jump cue</label>
            <input className="w-full border rounded-xl px-3 py-2" value={cueJump} onChange={(e) => setCueJump(e.target.value)} placeholder="Jump cue brand/model" />
          </div>
        </div>
      </Card>

      {/* Payments & Favorites */}
      <Card title="Payments & Preferences">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Cash App</label>
            <input className="w-full border rounded-xl px-3 py-2" value={cashapp} onChange={(e) => setCashapp(e.target.value)} placeholder="$yourcashtag" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Venmo</label>
            <input className="w-full border rounded-xl px-3 py-2" value={venmo} onChange={(e) => setVenmo(e.target.value)} placeholder="@yourvenmo" />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">Favorite game</label>
          <input className="w-full border rounded-xl px-3 py-2" value={favoriteGame} onChange={(e) => setFavoriteGame(e.target.value)} placeholder="8-ball, 9-ball, 10-ball, one pocket, etc." />
        </div>
      </Card>

      {/* Status + Save */}
      {err && <p className="text-red-600">{err}</p>}
      {msg && <p className="text-green-700">{msg}</p>}
      <button type="submit" disabled={saving} className="rounded-2xl px-5 py-2 border shadow disabled:opacity-50">
        {saving ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
