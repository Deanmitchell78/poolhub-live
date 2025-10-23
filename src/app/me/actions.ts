"use server";

import { supabaseServer } from "@/lib/supabase-server";

type UploadResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

function sanitizeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

const MAX_MB = 25;
const MAX_BYTES = MAX_MB * 1024 * 1024;

const AVATAR_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
]);

const BANNER_TYPES = AVATAR_TYPES; // same set; adjust if you want to allow video banners later

export async function uploadAvatarAction(formData: FormData): Promise<UploadResult> {
  try {
    const supabase = await supabaseServer(); // ✅ MUST await
    const { data: ud, error: userErr } = await supabase.auth.getUser();
    if (userErr) return { ok: false, error: userErr.message };
    const user = ud?.user;
    if (!user) return { ok: false, error: "Not authenticated" };

    const file = formData.get("file");
    if (!(file instanceof File)) {
      return { ok: false, error: "No file provided" };
    }
    if (file.size > MAX_BYTES) {
      return { ok: false, error: `File too large (max ${MAX_MB}MB)` };
    }
    if (!AVATAR_TYPES.has(file.type)) {
      return { ok: false, error: "Unsupported file type" };
    }

    const key = `${user.id}/${Date.now()}-${sanitizeName(file.name)}`;
    const up = await supabase.storage.from("avatars").upload(key, file, {
      upsert: false,
      cacheControl: "3600",
      contentType: file.type,
    });
    if (up.error) return { ok: false, error: up.error.message };

    const pub = supabase.storage.from("avatars").getPublicUrl(key);
    const publicUrl = pub.data.publicUrl;
    if (!publicUrl) return { ok: false, error: "Could not derive public URL" };

    const { error: updErr } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", user.id);
    if (updErr) return { ok: false, error: updErr.message };

    return { ok: true, url: publicUrl };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg };
  }
}

export async function uploadBannerAction(formData: FormData): Promise<UploadResult> {
  try {
    const supabase = await supabaseServer(); // ✅ MUST await
    const { data: ud, error: userErr } = await supabase.auth.getUser();
    if (userErr) return { ok: false, error: userErr.message };
    const user = ud?.user;
    if (!user) return { ok: false, error: "Not authenticated" };

    const file = formData.get("file");
    if (!(file instanceof File)) {
      return { ok: false, error: "No file provided" };
    }
    if (file.size > MAX_BYTES) {
      return { ok: false, error: `File too large (max ${MAX_MB}MB)` };
    }
    if (!BANNER_TYPES.has(file.type)) {
      return { ok: false, error: "Unsupported file type" };
    }

    const key = `${user.id}/${Date.now()}-${sanitizeName(file.name)}`;
    const up = await supabase.storage.from("banners").upload(key, file, {
      upsert: false,
      cacheControl: "3600",
      contentType: file.type,
    });
    if (up.error) return { ok: false, error: up.error.message };

    const pub = supabase.storage.from("banners").getPublicUrl(key);
    const publicUrl = pub.data.publicUrl;
    if (!publicUrl) return { ok: false, error: "Could not derive public URL" };

    const { error: updErr } = await supabase
      .from("profiles")
      .update({ banner_url: publicUrl })
      .eq("id", user.id);
    if (updErr) return { ok: false, error: updErr.message };

    return { ok: true, url: publicUrl };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg };
  }
}
