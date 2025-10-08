'use client';

import { useSession, signIn } from 'next-auth/react';

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { status } = useSession();

  if (status === 'loading') {
    return <p className="text-gray-600">Checking your session…</p>;
  }

  if (status === 'unauthenticated') {
    return (
      <div className="space-y-4">
        <p className="text-gray-700">You need to sign in to view this page.</p>
        <button className="px-3 py-1 border rounded" onClick={() => signIn('google')}>
          Sign in with Google
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
