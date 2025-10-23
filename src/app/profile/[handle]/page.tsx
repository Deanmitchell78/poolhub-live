export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import ProfileForm from "@/components/ProfileForm";

type Props = { params: { handle: string } };

export default async function ProfilePage({ params }: Props) {
  const supabase = supabaseServer();
  const handle = params.handle.toLowerCase();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select(
      "id, handle, full_name, avatar_url, league, other_league, apa_rating, napa_rating, fargo_rating, cue_play, cue_break, cue_jump, cashapp, venmo, favorite_game"
    )
    .eq("handle", handle)
    .maybeSingle();

  if (error || !profile) return notFound();

  const isOwner = !!user && user.id === profile.id;

  const leagueDisplay =
    profile.league === "Other" && profile.other_league
      ? `Other (${profile.other_league})`
      : profile.league || null;

  return (
    <main className="max-w-5xl mx-auto">
      {/* Hero */}
      <div className="rounded-2xl p-6 bg-gradient-to-r from-sky-500/20 via-fuchsia-500/20 to-violet-500/20 border shadow-sm mt-6">
        <div className="flex items-center gap-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.handle} className="w-24 h-24 rounded-full object-cover border shadow" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-white/60 border flex items-center justify-center text-sm">
              No photo
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold">@{profile.handle}</h1>
            {profile.full_name && <p className="text-gray-700">{profile.full_name}</p>}
          </div>
          {!isOwner && (
            <a href="/" className="rounded-2xl px-4 py-2 border shadow bg-white">Home</a>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Left column: public overview */}
        <section className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border shadow-sm bg-white">
            <div className="rounded-t-2xl px-4 py-3 bg-gradient-to-r from-sky-500/10 to-violet-500/10 border-b">
              <h2 className="font-semibold">Player info</h2>
            </div>
            <div className="p-4">
              <dl className="grid grid-cols-3 gap-2">
                <dt className="text-gray-500">Username</dt>
                <dd className="col-span-2">@{profile.handle}</dd>

                {profile.full_name && <>
                  <dt className="text-gray-500">Full name</dt>
                  <dd className="col-span-2">{profile.full_name}</dd>
                </>}

                {leagueDisplay && <>
                  <dt className="text-gray-500">League</dt>
                  <dd className="col-span-2">{leagueDisplay}</dd>
                </>}

                {profile.apa_rating && <>
                  <dt className="text-gray-500">APA</dt>
                  <dd className="col-span-2">{profile.apa_rating}</dd>
                </>}

                {profile.napa_rating && <>
                  <dt className="text-gray-500">NAPA</dt>
                  <dd className="col-span-2">{profile.napa_rating}</dd>
                </>}

                {profile.fargo_rating != null && <>
                  <dt className="text-gray-500">Fargo</dt>
                  <dd className="col-span-2">{profile.fargo_rating}</dd>
                </>}
              </dl>
            </div>
          </div>

          <div className="rounded-2xl border shadow-sm bg-white">
            <div className="rounded-t-2xl px-4 py-3 bg-gradient-to-r from-sky-500/10 to-violet-500/10 border-b">
              <h2 className="font-semibold">Equipment</h2>
            </div>
            <div className="p-4">
              <dl className="grid grid-cols-3 gap-2">
                {profile.cue_play && <>
                  <dt className="text-gray-500">Cue</dt>
                  <dd className="col-span-2">{profile.cue_play}</dd>
                </>}
                {profile.cue_break && <>
                  <dt className="text-gray-500">Break cue</dt>
                  <dd className="col-span-2">{profile.cue_break}</dd>
                </>}
                {profile.cue_jump && <>
                  <dt className="text-gray-500">Jump cue</dt>
                  <dd className="col-span-2">{profile.cue_jump}</dd>
                </>}
              </dl>
            </div>
          </div>

          <div className="rounded-2xl border shadow-sm bg-white">
            <div className="rounded-t-2xl px-4 py-3 bg-gradient-to-r from-sky-500/10 to-violet-500/10 border-b">
              <h2 className="font-semibold">Payments / Preferences</h2>
            </div>
            <div className="p-4">
              <dl className="grid grid-cols-3 gap-2">
                {profile.cashapp && <>
                  <dt className="text-gray-500">Cash App</dt>
                  <dd className="col-span-2">{profile.cashapp}</dd>
                </>}
                {profile.venmo && <>
                  <dt className="text-gray-500">Venmo</dt>
                  <dd className="col-span-2">{profile.venmo}</dd>
                </>}
                {profile.favorite_game && <>
                  <dt className="text-gray-500">Favorite game</dt>
                  <dd className="col-span-2">{profile.favorite_game}</dd>
                </>}
              </dl>
            </div>
          </div>
        </section>

        {/* Right column: editor (owner only) */}
        <section className="lg:col-span-2">
          {isOwner ? (
            <>
              <div className="rounded-2xl border shadow-sm bg-white mb-6">
                <div className="rounded-t-2xl px-4 py-3 bg-gradient-to-r from-sky-500/10 to-violet-500/10 border-b">
                  <h2 className="font-semibold">Edit your profile</h2>
                </div>
                <div className="p-4">
                  <ProfileForm
                    userId={profile.id}
                    initialHandle={profile.handle}
                    initialFullName={profile.full_name ?? ""}
                    initialAvatarUrl={profile.avatar_url}
                    initialLeague={profile.league}
                    initialOtherLeague={profile.other_league}
                    initialApaRating={profile.apa_rating}
                    initialNapaRating={profile.napa_rating}
                    initialFargoRating={profile.fargo_rating}
                    initialCuePlay={profile.cue_play}
                    initialCueBreak={profile.cue_break}
                    initialCueJump={profile.cue_jump}
                    initialCashapp={profile.cashapp}
                    initialVenmo={profile.venmo}
                    initialFavoriteGame={profile.favorite_game}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-2xl border shadow-sm bg-white p-6 text-gray-600">
              This is {profile.full_name || `@${profile.handle}`}'s public profile.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
