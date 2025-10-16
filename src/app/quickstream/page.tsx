"use client";
import { useState } from "react";
import Link from "next/link";

export default function QuickStreamPage() {
  const [url, setUrl] = useState("");
  const [link, setLink] = useState("");

  const handleCreate = () => {
    if (!url) return alert("Enter an HLS URL first");
    const encoded = encodeURIComponent(url);
    setLink(`/watch?url=${encoded}`);
  };

  return (
    <main className="min-h-dvh p-6 flex flex-col items-center gap-6">
      <h1 className="text-2xl font-bold">Quick Stream Link</h1>

      <div className="flex flex-col gap-3 w-full max-w-md">
        <input
          className="border p-2 rounded"
          placeholder="Paste your HLS URL (from Cloudflare)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Generate Link
        </button>
      </div>

      {link && (
        <div className="mt-4 text-center">
          <p>Your quick watch link:</p>
          <Link href={link} className="text-blue-600 underline">
            {link}
          </Link>
        </div>
      )}
    </main>
  );
}
