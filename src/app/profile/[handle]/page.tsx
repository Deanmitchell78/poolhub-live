import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

type Props = { params: { handle: string } };

export default async function ProfilePage({ params }: Props) {
  const handle = params.handle.toLowerCase();

  const user = await prisma.user.findUnique({
    where: { handle },
    select: {
      id: true,
      name: true,
      image: true,
      handle: true,
      profile: {
        select: {
          apa: true,
          fargo: true,
          napa: true,
          poolroomAlias: true,
          cue: true,
          location: true,
          cashapp: true,
          venmo: true,
          bio: true,
          views: true,
        },
      },
    },
  });

  if (!user) {
    notFound();
  }

  // Increment view count (if a profile row exists)
  if (user.profile) {
    await prisma.profile.update({
      where: { userId: user.id },
      data: { views: { increment: 1 } },
    });
  }

  const p = user.profile;

  return (
    <main className="min-h-screen p-8 space-y-6">
      <div className="flex items-center gap-4">
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.image}
            alt={`${user.name ?? user.handle} avatar`}
            className="w-12 h-12 rounded-full"
          />
        ) : null}
        <div>
          <h1 className="text-3xl font-bold">@{user.handle}</h1>
          {user.name ? <p className="text-gray-600">{user.name}</p> : null}
        </div>
      </div>

      {p ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="space-y-2">
            <h2 className="font-semibold">Ratings</h2>
            <div className="grid grid-cols-3 gap-2">
              {p.apa != null ? (
                <div className="border rounded p-2">
                  <div className="text-xs text-gray-500">APA</div>
                  <div className="text-xl font-semibold">{p.apa}</div>
                </div>
              ) : null}
              {p.fargo != null ? (
                <div className="border rounded p-2">
                  <div className="text-xs text-gray-500">Fargo</div>
                  <div className="text-xl font-semibold">{p.fargo}</div>
                </div>
              ) : null}
              {p.napa != null ? (
                <div className="border rounded p-2">
                  <div className="text-xs text-gray-500">NAPA</div>
                  <div className="text-xl font-semibold">{p.napa}</div>
                </div>
              ) : null}
            </div>

            {p.poolroomAlias ? (
              <p>
                <strong>Poolroom Alias:</strong> {p.poolroomAlias}
              </p>
            ) : null}
            {p.cue ? (
              <p>
                <strong>Cue:</strong> {p.cue}
              </p>
            ) : null}
            {p.location ? (
              <p>
                <strong>Location:</strong> {p.location}
              </p>
            ) : null}
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold">Support</h2>
            <div className="flex gap-4">
              {p.cashapp ? (
                <a
                  className="underline"
                  href={`https://cash.app/${p.cashapp.replace(/^\$/, "")}`}
                  target="_blank"
                >
                  Cash App
                </a>
              ) : null}
              {p.venmo ? (
                <a
                  className="underline"
                  href={`https://venmo.com/${p.venmo.replace(/^@/, "")}`}
                  target="_blank"
                >
                  Venmo
                </a>
              ) : null}
            </div>
            {typeof p.views === "number" ? (
              <p className="text-sm text-gray-500">Views: {p.views}</p>
            ) : null}
          </section>
        </div>
      ) : (
        <p className="text-gray-600">No profile details yet.</p>
      )}

      {p?.bio ? (
        <section>
          <h2 className="font-semibold">Bio</h2>
          <p className="text-gray-800 whitespace-pre-line">{p.bio}</p>
        </section>
      ) : null}
    </main>
  );
}
