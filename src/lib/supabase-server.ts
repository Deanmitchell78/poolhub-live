import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

/**
 * Next.js 15: cookies() is async. Call this with `await`.
 *
 * Example:
 *   const supabase = await supabaseServer();
 *   const { data } = await supabase.auth.getUser();
 */
export async function supabaseServer() {
  const cookieStore = await cookies(); // <-- await is required in Next 15

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // These can be async in @supabase/ssr
        get: async (name: string) => cookieStore.get(name)?.value,
        set: async (name: string, value: string, options: CookieOptions) => {
          cookieStore.set(name, value, options);
        },
        remove: async (name: string, options: CookieOptions) => {
          cookieStore.set(name, "", { ...options, maxAge: 0 });
        },
      },
    }
  );

  return supabase;
}
