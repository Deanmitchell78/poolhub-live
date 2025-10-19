export const dynamic = "force-static";
export default function Home() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">PoolHub.live</h1>
      <p>Safe home loaded.</p>
      <ul className="list-disc pl-6 mt-3">
        <li><a className="underline" href="/watch">Watch</a></li>
        <li><a className="underline" href="/profile">Profile</a></li>
        <li><a className="underline" href="/api/health">Health</a></li>
      </ul>
    </main>
  );
}
