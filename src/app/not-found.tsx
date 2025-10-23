export default function NotFound() {
  return (
    <main className="max-w-xl mx-auto p-6 text-center">
      <h1 className="text-2xl font-bold mb-2">We couldn't find that page</h1>
      <p className="text-gray-600 mb-6">
        The link may be broken, or the route doesn't exist.
      </p>
      <div className="flex gap-3 justify-center">
        <a href="/" className="rounded-2xl px-4 py-2 border shadow">Go home</a>
        <a href="/tournaments" className="rounded-2xl px-4 py-2 border shadow">Browse tournaments</a>
      </div>
    </main>
  );
}
