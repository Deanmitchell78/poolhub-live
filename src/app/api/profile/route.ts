// src/app/api/profile/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  // Ensure user exists (upsert by email)
  const user = await prisma.user.upsert({
    where: { email: session.user.email },
    update: {
      name: session.user.name ?? undefined,
      image: session.user.image ?? undefined,
    },
    create: {
      email: session.user.email,
      name: session.user.name ?? null,
      image: session.user.image ?? null,
    },
  });

  // Ensure profile row exists
  const profile = await prisma.profile.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id },
  });

  return NextResponse.json({
    ok: true,
    user: { id: user.id, email: user.email, name: user.name, image: user.image },
    profile,
  });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as Record<string, unknown>;

  // Make sure the user exists
  const user = await prisma.user.upsert({
    where: { email: session.user.email },
    update: {
      name: session.user.name ?? undefined,
      image: session.user.image ?? undefined,
    },
    create: {
      email: session.user.email,
      name: session.user.name ?? null,
      image: session.user.image ?? null,
    },
  });

  // Keep only allowed fields
  const allowed = [
    "apa",
    "fargo",
    "napa",
    "poolroomAlias",
    "cue",
    "location",
    "cashapp",
    "venmo",
    "bio",
  ] as const;

  const data: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) data[key] = body[key];
  }

  // Normalize numbers
  for (const k of ["apa", "fargo", "napa"] as const) {
    if (data[k] !== undefined && data[k] !== null && data[k] !== "") {
      const n = Number(data[k]);
      data[k] = Number.isFinite(n) ? Math.trunc(n) : null;
    }
  }

  const profile = await prisma.profile.upsert({
    where: { userId: user.id },
    update: data,
    create: { userId: user.id, ...(data as object) },
  });

  return NextResponse.json({ ok: true, profile });
}
