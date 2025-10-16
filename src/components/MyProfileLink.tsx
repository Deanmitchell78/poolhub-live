'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export default function MyProfileLink() {
  const { status } = useSession();
  const [handle, setHandle] = useState<string | null>(null);

  useEffect(() => {
    if (status !== 'authenticated') return;
    (async () => {
      try {
        const res = await fetch('/api/profile');
        if (!res.ok) return;
        const data = await res.json();
        const h = (data?.user?.handle as string | null | undefined) ?? null;
        setHandle(h);
      } catch {}
    })();
  }, [status]);

  if (status !== 'authenticated') return null;

  if (handle) {
    return <Link className="px-3 py-1 border rounded" href={`/profile/${handle}`}>My Profile</Link>;
  }
  return <Link className="px-3 py-1 border rounded" href="/settings">Claim Handle</Link>;
}
