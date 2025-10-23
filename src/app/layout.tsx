import "./globals.css";
import type { Metadata } from "next";
import Header from "@/components/Header"; // keep your existing header import/path
import LeftColumn from "@/components/LeftColumn";
import { supabaseServer } from "@/lib/supabase-server";

export const metadata: Metadata = {
  title: "PoolHub Live",
  description: "Live streams, events, tournaments, leagues",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await supabaseServer(); // Next 15: await
  const { data } = await supabase.auth.getUser();
  const userId = data?.user?.id ?? null;

  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900">
        <Header />
        {/* Use a grid wrapper here; let pages render whatever they want inside */}
        <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left column: visible on large screens */}
          <div className="hidden lg:block lg:col-span-4">
            <LeftColumn me={userId} />
          </div>

          {/* Content column */}
          <div className="lg:col-span-8">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
