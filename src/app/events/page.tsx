export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { supabaseServer } from "../../lib/supabase-server";

export default async function EventsPage() {
  const supabase = supabaseServer();
  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Events</h1>
      <p className="text-gray-700">
        Signed in as <span className="font-semibold">{user.email}</span>.
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>Upcoming events (coming soon)</li>
        <li>Your RSVPs (coming soon)</li>
      </ul>
    </main>
  );
}
