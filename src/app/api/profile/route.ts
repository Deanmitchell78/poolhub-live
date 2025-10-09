// src/app/api/profile/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function isValidHandle(s: unknown): s is string {
  if (typeof s !== "string") return false;
  const v = s.trim().toLowerCase();
  // 3–20 chars, lowercase letters, numbers, dot, underscore, hyphen
  return /^[a-z0-9._-]{3,20}$/.test(v);
}

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
    user: { id: user.id, email: user.email, name: user.name, image: user.image, handle: user.handle },
    profile,
  });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as Record<string, unknown>;

  // Upsert user by email first
  let user = await prisma.user.upsert({
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

  // If client sent a handle, validate and set it (unique)
  if (body.handle !== undefined) {
    if (!isValidHandle(body.handle)) {
      return NextResponse.json(
        { ok: false, error: "Handle must be 3–20 chars: a-z, 0-9, dot, underscore, hyphen." },
        { status: 400 }
      );
    }
    const desired = String(body.handle).trim().toLowerCase();
    if (user.handle !== desired) {
      const existing = await prisma.user.findUnique({ where: { handle: desired } });
      if (existing && existing.id !== user.id) {
        return NextResponse.json({ ok: false, error: "Handle is already taken." }, { status: 409 });
      }
      user = await prisma.user.update({
        where: { id: user.id },
        data: { handle: desired },
      });
    }
  }

  // Keep only allowed profile fields
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

  return NextResponse.json({ ok: true, user: { id: user.id, handle: user.handle }, profile });
}
