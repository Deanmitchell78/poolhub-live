import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await supabaseServer(); // <-- await
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      return NextResponse.json({ userId: null, error: error.message }, { status: 200 });
    }
    const userId = data?.user?.id ?? null;
    return NextResponse.json({ userId }, { status: 200 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ userId: null, error: msg }, { status: 200 });
  }
}
