"use server";

import { supabaseServer } from "@/lib/supabase-server";

function assertImage(file: File, maxMb = 5) {
  if (!file) throw new Error("No file selected");
  if (file.size > maxMb * 1024 * 1024) throw new Error(`Max file size is ${maxMb}MB`);
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.type)) throw new Error("Only JPG, PNG, WEBP allowed");
}

/** BANNERS */
export async function uploadBannerAction(formData: FormData) {
  const supabase = supabaseServer();
  const { data: ud } = await supabase.auth.getUser();
  const user = ud?.user;
  if (!user) throw new Error("Not authenticated");

  const file = formData.get("banner") as File | null;
  assertImage(file!, 5);

  const ext = (file!.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${user.id}/banner.${ext}`;

  // Convert to raw bytes for server action upload
  const bytes = new Uint8Array(await file!.arrayBuffer());

  const { error: upErr } = await supabase.storage
    .from("banners")
    .upload(path, bytes, { upsert: true, contentType: file!.type });
  if (upErr) throw new Error(upErr.message);

  const { data } = supabase.storage.from("banners").getPublicUrl(path);
  const publicUrl = data.publicUrl;

  const { error: profErr } = await supabase
    .from("profiles")
    .update({ banner_url: publicUrl })
    .eq("id", user.id);
  if (profErr) throw new Error(profErr.message);

  return { ok: true, url: publicUrl };
}

/** AVATARS */
export async function uploadAvatarAction(formData: FormData) {
  const supabase = supabaseServer();
  const { data: ud } = await supabase.auth.getUser();
  const user = ud?.user;
  if (!user) throw new Error("Not authenticated");

  const file = formData.get("avatar") as File | null;
  assertImage(file!, 5);

  const ext = (file!.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${user.id}/avatar.${ext}`;

  const bytes = new Uint8Array(await file!.arrayBuffer());

  const { error: upErr } = await supabase.storage
    .from("avatars")
    .upload(path, bytes, { upsert: true, contentType: file!.type });
  if (upErr) throw new Error(upErr.message);

  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  const publicUrl = data.publicUrl;

  const { error: profErr } = await supabase
    .from("profiles")
    .update({ avatar_url: publicUrl })
    .eq("id", user.id);
  if (profErr) throw new Error(profErr.message);

  return { ok: true, url: publicUrl };
}

/** POSTS: text + image/video */
export async function createPostAction(formData: FormData) {
  const supabase = supabaseServer();
  const { data: ud } = await supabase.auth.getUser();
  const user = ud?.user;
  if (!user) throw new Error("Not authenticated");

  const content = (formData.get("content") as string | null) ?? "";
  let mediaUrl: string | null = null;

  const file = formData.get("media") as File | null;

  try {
    if (file && file.size > 0) {
      const allowed = ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/webm"];
      if (!allowed.includes(file.type)) {
        throw new Error(`Unsupported type: ${file.type}`);
      }
      if (file.size > 50 * 1024 * 1024) {
        throw new Error(`File too large (${(file.size/1024/1024).toFixed(1)}MB). Max 50MB.`);
      }

      const ext = (file.name.split(".").pop() || "bin").toLowerCase();
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const bytes = new Uint8Array(await file.arrayBuffer());

      const { error: upErr } = await supabase.storage
        .from("post-media")
        .upload(path, bytes, { upsert: false, contentType: file.type });

      if (upErr) throw new Error(`Storage upload failed: ${upErr.message}`);

      const { data: urlData } = supabase.storage.from("post-media").getPublicUrl(path);
      mediaUrl = urlData.publicUrl;
      if (!mediaUrl) throw new Error("Public URL not returned for uploaded media");
    }

    const { error: insErr } = await supabase.from("posts").insert({
      author_id: user.id,
      content,
      image_url: mediaUrl, // stores image OR video URL
    });
    if (insErr) throw new Error(`Post insert failed: ${insErr.message}`);

    return { ok: true };
  } catch (e: any) {
    throw new Error(e?.message ?? "Unexpected error during post");
  }
}
