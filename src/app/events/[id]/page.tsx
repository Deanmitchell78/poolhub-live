import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

function fmt(dt: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(dt);
}

export default async function EventDetailPage({ params }: { params: { id: string } }) {
  const event = await prisma.event.findUnique({
    where: { id: params.id },
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

  if (!event) notFound();

  return (
    <main className="min-h-screen p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{event.title}</h1>
        <Link href="/events" className="text-sm underline">← Back to Events</Link>
      </div>

      <p className="text-gray-600">
        {fmt(event.startsAt)}
        {event.endsAt ? ` → ${fmt(event.endsAt)}` : ""} • {event.city ?? "—"}
        {event.state ? `, ${event.state}` : ""}
      </p>

      {event.description ? (
        <p className="text-gray-800 whitespace-pre-line">{event.description}</p>
      ) : (
        <p className="text-gray-500">No description.</p>
      )}
    </main>
  );
}
export default function EventDetailPage() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold">Event</h1>
      <p className="text-gray-600">Loading…</p>
    </main>
  );
}
