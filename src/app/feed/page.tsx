export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { supabaseServer } from "../../lib/supabase-server";

export default async function FeedPage() {
  const supabase = supabaseServer();
  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Feed</h1>
      <p className="text-gray-700">
        Welcome, <span className="font-semibold">{user.email}</span>. Your feed will go here.
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>Activity item (coming soon)</li>
        <li>Another item (coming soon)</li>
      </ul>
    </main>
  );
}
