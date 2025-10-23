import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = supabaseServer();
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      return NextResponse.json({ userId: null, error: error.message }, { status: 200 });
    }
    const userId = data?.user?.id ?? null;
    return NextResponse.json({ userId }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ userId: null, error: String(e?.message || e) }, { status: 200 });
  }
}
