import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Read envs (may be undefined during build; that's okay here)
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (_client) return _client;
  if (!url || !anon) {
    // Throw only when actually used at runtime without envs present
    throw new Error(
      "Supabase env vars missing: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }
  _client = createClient(url, anon, { auth: { persistSession: false } });
  return _client;
}

// Export a proxy so existing imports keep working: `import { supabase } from "@/lib/supabase"`
export const supabase = new Proxy({} as SupabaseClient, {
  get(_t, prop) {
    const c = getClient();
    // @ts-expect-error dynamic property access
    return c[prop];
  },
});
