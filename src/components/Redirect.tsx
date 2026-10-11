'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/** Client-side redirect for legacy routes in the static export. */
export default function Redirect({ to, label }: { to: string; label: string }) {
  const router = useRouter();
  useEffect(() => {
    router.replace(to);
  }, [router, to]);
  return (
    <main className="wrap flex min-h-[100svh] items-center">
      <p className="label text-grey-2">
        This page has moved.{' '}
        <Link href={to} className="link-quiet text-paper">
          {label}
        </Link>
      </p>
    </main>
  );
}
