"use client";
export default function GlobalError({ error, reset }: { error: any; reset: () => void }) {
  console.error("App crashed:", error);
  return (
    <html><body style={{padding:16}}>
      <h1>Something went wrong</h1>
      <pre style={{whiteSpace:"pre-wrap"}}>{String(error?.message ?? error)}</pre>
      <button onClick={() => reset()}>Try again</button>
    </body></html>
  );
}
