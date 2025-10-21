export default function NotFound() {
  return (
    <main className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-3xl font-bold">We couldn’t find that page</h1>
      <p className="text-gray-700">
        The link may be broken, or the route doesn’t exist.
      </p>
      <div className="space-x-3">
        <a href="/" className="px-4 py-2 bg-black text-white rounded">Go home</a>
        <a href="/tournaments" className="px-4 py-2 border rounded">Browse tournaments</a>
      </div>
    </main>
  );
}
