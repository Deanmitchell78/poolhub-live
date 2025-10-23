import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

/** Convert <input type="datetime-local"> -> ISO (UTC) */
function localToIso(datetimeLocal: string | null): string | null {
  if (!datetimeLocal) return null;
  const dt = new Date(datetimeLocal);
  return isNaN(dt.getTime()) ? null : dt.toISOString();
}

/** Basic slugify: lower-case, hyphens, ascii only, collapse dashes */
function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/** Ensure slug uniqueness by appending -2, -3, ... if needed */
async function uniqueSlug(baseSlug: string, supabase: any) {
  let slug = baseSlug || "tournament";
  let n = 1;
  while (true) {
    const { data, error } = await supabase
      .from("tournaments")
      .select("id")
      .eq("slug", slug)
      .limit(1);
    if (error) {
      // if the uniqueness check fails, just return the base (don’t block creation)
      return slug;
    }
    if (!data || data.length === 0) return slug;
    n += 1;
    slug = `${baseSlug}-${n}`;
  }
}

export async function POST(req: NextRequest) {
  const supabase = await supabaseServer(); // get the CLIENT

  // Require auth + plan
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  if (!user) return NextResponse.redirect(new URL("/sign-in", base));

  // Check membership plan (free/pro/td)
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .maybeSingle();
  const plan = profile?.plan ?? "free";
  if (!(plan === "pro" || plan === "td")) {
    return NextResponse.redirect(new URL("/settings?upgrade=pro", base));
  }

  const form = await req.formData();
  const name = (form.get("name")?.toString() || "").trim();
  const starts_at_local = form.get("starts_at")?.toString() || null;
  const city = (form.get("city")?.toString() || "").trim() || null;
  const format = (form.get("format")?.toString() || "").trim() || null;
  const entry_fee_str = (form.get("entry_fee")?.toString() || "").trim() || "";
  const description = (form.get("description")?.toString() || "").trim() || null;
  const banner_url = (form.get("banner_url")?.toString() || "").trim() || null;

  const starts_at = localToIso(starts_at_local);
  const entry_fee_cents = entry_fee_str ? Math.round(parseFloat(entry_fee_str) * 100) : null;

  if (!name || !starts_at) {
    return NextResponse.json(
      { ok: false, error: "Name and start time are required." },
      { status: 400 }
    );
  }

  const baseSlug = slugify(name);
  // ✅ pass the CLIENT, not the factory
  const slug = await uniqueSlug(baseSlug, supabase);

  const { data, error } = await supabase
    .from("tournaments")
    .insert({
      owner_id: user.id,
      name,
      slug,
      starts_at,
      city,
      format,
      entry_fee_cents,
      description,
      banner_url,
      created_at: new Date().toISOString(),
    })
    .select("slug")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Failed to create tournament." },
      { status: 400 }
    );
  }

  return NextResponse.redirect(new URL(`/tournaments/${data.slug}`, base));
}

export {};
