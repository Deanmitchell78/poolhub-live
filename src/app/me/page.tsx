export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { supabaseServer } from "../../lib/supabase-server";
import SignOutButton from "@/components/SignOutButton";
import ProfileForm from "@/components/ProfileForm";

export default async function MePage() {
  const supabase = supabaseServer();

  // Get the logged-in user
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  if (!user) {
    redirect("/sign-in");
  }

  // Fetch profile (handle + full_name)
  const { data: profile } = await supabase
    .from("profiles")
    .select("handle, full_name")
    .eq("id", user.id)
    .maybeSingle();

  const initialFullName = profile?.full_name ?? null;
  const handle = profile?.handle ?? null;

  return (
    <main className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Your Account</h1>

      <p>
        <span className="font-semibold">Email:</span> {user.email}
      </p>

      <p>
        <span className="font-semibold">Username:</span>{" "}
        {handle ? <span>@{handle}</span> : <span className="text-gray-500">not set</span>}
      </p>

      {/* Editable fields */}
      <ProfileForm
        userId={user.id}
        initialFullName={initialFullName}
        initialHandle={handle}
      />

      <SignOutButton />

      <div className="pt-4">
        <a className="underline" href="/">
          Back to home
        </a>
      </div>
    </main>
  );
}
