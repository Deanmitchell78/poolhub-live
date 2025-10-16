"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function listEvents() {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("starts_at", { ascending: true })
    .limit(50);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createEvent(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const startsAt = String(formData.get("startsAt") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!title || !startsAt) {
    return { ok: false, error: "Title and Start time are required." };
  }

  const { error } = await supabase.from("events").insert({
    title,
    starts_at: new Date(startsAt).toISOString(),
    location,
    description,
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath("/events");
  redirect("/events"); // <-- jump back to the list after creating
}
