export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import React from "react";
import { supabaseServer } from "../../lib/supabase-server";


export default async function ProfilePage() {
  const supabase = supabaseServer();
  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  if (!user) {
    return (
      <main className="max-w-xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-2">Profile</h1>
        <a className="underline" href="/(auth)/sign-in">Sign in</a>
      </main>
    );
  }

  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">Welcome</h1>
      <p>Email: {user.email}</p>
      <p>User ID: {user.id}</p>
    </main>
  );
}
