'use client';

import { useSession, signIn, signOut } from 'next-auth/react';

export default function AuthButtons() {
  const { data: session, status } = useSession();

  if (status === 'loading') return <span className="text-sm text-gray-500">…</span>;

  if (session) {
    return (
      <div className="flex items-center gap-3">
        {session.user?.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt="avatar"
            src={session.user.image}
            className="w-6 h-6 rounded-full"
          />
        ) : null}
        <span className="text-sm">{session.user?.name}</span>
        <button
          className="px-3 py-1 border rounded"
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <button
      className="px-3 py-1 border rounded"
      onClick={() => signIn('google')}
    >
      Sign in
    </button>
  );
}
