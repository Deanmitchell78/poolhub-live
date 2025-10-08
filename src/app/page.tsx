import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center p-8">
      <h1 className="text-4xl font-bold mb-4">Welcome to PoolHub.Live 🎱</h1>
      <p className="text-gray-600 mb-10">
        Profiles, streams & events — fast.
      </p>

      <section>
        <p className="mb-3 text-gray-700">Try a profile:</p>
        <div className="flex gap-4 justify-center">
          <Link className="underline" href="/profile/dean">@dean</Link>
          <Link className="underline" href="/profile/poolhub">@poolhub</Link>
        </div>
      </section>
    </main>
  );
}
