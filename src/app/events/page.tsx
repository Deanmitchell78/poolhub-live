import Link from "next/link";
import { prisma } from "@/lib/prisma";

function fmt(dt: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(dt);
}

export default async function EventsPage() {
  const now = new Date();

  const events = await prisma.event.findMany({
    where: { startsAt: { gte: now } },
    orderBy: { startsAt: "asc" },
    take: 50,
    select: {
      id: true,
      title: true,
      startsAt: true,
      endsAt: true,
      city: true,
      state: true,
      description: true,
    },
  });

  return (
    <main className="min-h-screen p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Events</h1>
        <Link href="/events/new" className="px-3 py-2 border rounded text-sm">
          + Create Event
        </Link>
      </div>

      {events.length === 0 ? (
        <p className="text-gray-600">No upcoming events yet. Check back soon.</p>
      ) : (
        <ul className="space-y-4">
          {events.map((e) => (
            <li key={e.id} className="border rounded-lg p-4">
              <h2 className="text-xl font-semibold">{e.title}</h2>
              <p className="text-sm text-gray-600">
                {fmt(e.startsAt)}
                {e.endsAt ? ` → ${fmt(e.endsAt)}` : ""} • {e.city ?? "—"}
                {e.state ? `, ${e.state}` : ""}
              </p>
              {e.description ? (
                <p className="mt-2 text-gray-800 whitespace-pre-line">{e.description}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
