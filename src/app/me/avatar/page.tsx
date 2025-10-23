export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { supabaseServer } from "@/lib/supabase-server";
import AvatarUploader from "../components/AvatarUploader";

export default async function AvatarPage() {
  const supabase = supabaseServer();
  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  if (!user) {
    return (
      <main className="max-w-xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-2">Update Avatar</h1>
        <a className="underline" href="/(auth)/sign-in">Sign in</a>
      </main>
    );
  }

  const { data: prof } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Your Avatar</h1>
      {prof?.avatar_url && (
        <img
          src={prof.avatar_url}
          alt="Current avatar"
          className="h-28 w-28 rounded-full object-cover border"
        />
      )}
      <AvatarUploader />
    </main>
  );
}
