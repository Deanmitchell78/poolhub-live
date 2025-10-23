"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error("App crashed:", error);
  return (
    <div style={{ padding: 16 }}>
      <h1>Something went wrong</h1>
      <pre style={{ whiteSpace: "pre-wrap" }}>
        {String(error?.message ?? error)}
      </pre>
      <button
        onClick={() => reset()}
        style={{ marginTop: 12, padding: "8px 12px", border: "1px solid #ddd", borderRadius: 8 }}
      >
        Try again
      </button>
    </div>
  );
}
