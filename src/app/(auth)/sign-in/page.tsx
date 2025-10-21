export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { supabaseServer } from "../../../lib/supabase-server";
import SignInClient from "./SignInClient";

export default async function Page() {
  const supabase = supabaseServer();
  const { data } = await supabase.auth.getUser();

  if (data?.user) {
    redirect("/me");
  }

  return <SignInClient />;
}
