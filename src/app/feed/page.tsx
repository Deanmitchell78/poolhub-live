export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { supabaseServer } from "@/lib/supabase-server";
import FeedClient from "./FeedClient";

export default async function FeedPage() {
  const supabase = await supabaseServer(); // <-- await
  const { data } = await supabase.auth.getUser();
  const userId = data?.user?.id ?? null;
  return <FeedClient userId={userId} />;
}
