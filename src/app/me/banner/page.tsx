export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { supabaseServer } from "@/lib/supabase-server";
import BannerUploader from "../components/BannerUploader";

export default async function BannerPage() {
  const supabase = supabaseServer();
  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  if (!user) {
    return (
      <main className="max-w-xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-2">Update Banner</h1>
        <a className="underline" href="/(auth)/sign-in">Sign in</a>
      </main>
    );
  }

  const { data: prof } = await supabase
    .from("profiles")
    .select("banner_url")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Your Banner</h1>
      {prof?.banner_url && (
        <img
          src={prof.banner_url}
          alt="Current banner"
          className="w-full max-h-64 object-cover rounded-xl border"
        />
      )}
      <BannerUploader />
    </main>
  );
}
