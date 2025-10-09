import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center p-8">
      <h1 className="text-3xl font-bold mb-3">We couldn’t find that page</h1>
      <p className="text-gray-600 mb-8">
        The link may be broken, or the profile/route doesn’t exist.
      </p>

      <div className="flex gap-4">
        <Link href="/" className="px-4 py-2 border rounded">Go home</Link>
        <Link href="/settings" className="px-4 py-2 border rounded">Claim your handle</Link>
      </div>

      <p className="text-xs text-gray-500 mt-8">
        Tip: Profiles live at <code>/profile/&lt;handle&gt;</code>
      </p>
    </main>
  );
}
