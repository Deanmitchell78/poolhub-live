// src/app/api/events/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as Record<string, unknown>;
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const startsAt = typeof body.startsAt === "string" ? body.startsAt : "";
  const endsAt = typeof body.endsAt === "string" ? body.endsAt : "";
  const city = typeof body.city === "string" ? body.city.trim() : undefined;
  const state = typeof body.state === "string" ? body.state.trim().toUpperCase() : undefined;
  const description = typeof body.description === "string" ? body.description.trim() : undefined;

  if (title.length < 3 || title.length > 100) {
    return NextResponse.json({ ok: false, error: "Title must be 3–100 chars." }, { status: 400 });
  }

  const start = new Date(startsAt);
  if (Number.isNaN(start.getTime())) {
    return NextResponse.json({ ok: false, error: "Invalid start date/time." }, { status: 400 });
  }

  let end: Date | undefined;
  if (endsAt) {
    const e = new Date(endsAt);
    if (Number.isNaN(e.getTime())) {
      return NextResponse.json({ ok: false, error: "Invalid end date/time." }, { status: 400 });
    }
    if (e < start) {
      return NextResponse.json({ ok: false, error: "End must be after start." }, { status: 400 });
    }
    end = e;
  }

  // Ensure user row exists
  const user = await prisma.user.upsert({
    where: { email: session.user.email },
    update: { name: session.user.name ?? undefined, image: session.user.image ?? undefined },
    create: { email: session.user.email, name: session.user.name ?? null, image: session.user.image ?? null },
  });

  const event = await prisma.event.create({
    data: {
      title,
      startsAt: start,
      endsAt: end,
      city,
      state,
      description,
      createdById: user.id,
    },
    select: { id: true },
  });

  return NextResponse.json({ ok: true, id: event.id });
}
