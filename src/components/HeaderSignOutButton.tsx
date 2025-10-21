"use client";

import { useRouter } from "next/navigation";

export default function HeaderSignOutButton() {
  const router = useRouter();

  async function handle() {
    try {
      await fetch("/api/signout", { method: "POST" });
    } finally {
      // Hard navigate to ensure server re-renders without cookies
      window.location.replace("/sign-in");
    }
  }

  return (
    <button
      onClick={handle}
      className="px-3 py-1.5 rounded border"
      aria-label="Sign out"
    >
      Sign out
    </button>
  );
}
