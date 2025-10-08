export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center p-8">
      <h1 className="text-4xl font-bold mb-4">Welcome to PoolHub.Live 🎱</h1>
      <p className="text-gray-600 mb-6">
        Profiles, streams & events — fast.

      </p>

      <nav className="flex gap-4">
        <a className="px-4 py-2 rounded-lg border" href="/feed">Feed</a>
        <a className="px-4 py-2 rounded-lg border" href="/live">Live</a>
        <a className="px-4 py-2 rounded-lg border" href="/events">Events</a>
      </nav>
    </main>
  );
}
