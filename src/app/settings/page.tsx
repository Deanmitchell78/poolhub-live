export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { supabaseServer } from "../../lib/supabase-server";

export default async function SettingsPage() {
  const supabase = supabaseServer();
  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <main className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Settings</h1>
      <p><span className="font-semibold">Signed in as:</span> {user.email}</p>

      <ul className="list-disc pl-5 space-y-2">
        <li>Account details (coming soon)</li>
        <li>Notifications (coming soon)</li>
        <li>Privacy (coming soon)</li>
      </ul>
    </main>
  );
}
