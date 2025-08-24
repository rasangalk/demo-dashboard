'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from './Sidebar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const hideSidebar = pathname === '/login';
  const [authChecked, setAuthChecked] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    if (hideSidebar) {
      // login page: no auth check required
      setAuthChecked(true);
      return;
    }
    let cancelled = false;
    fetch('/api/auth/me', { credentials: 'include', cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled) return;
        if (data?.authenticated) {
          setAuthed(true);
        } else {
          router.replace('/login?redirect=' + encodeURIComponent(pathname));
        }
      })
      .finally(() => {
        if (!cancelled) setAuthChecked(true);
      });
    return () => {
      cancelled = true;
    };
  }, [hideSidebar, pathname, router]);

  if (!authChecked) {
    return (
      <div className='flex min-h-screen items-center justify-center text-sm text-muted-foreground'>
        Verifying session...
      </div>
    );
  }

  if (hideSidebar) {
    return <main className='flex-1 p-8 overflow-auto w-full'>{children}</main>;
  }

  if (!authed) {
    // Redirect initiated; render nothing to avoid flash
    return null;
  }

  return (
    <div className='flex w-full'>
      <Sidebar />
      <main className='flex-1 p-8 overflow-auto'>{children}</main>
    </div>
  );
}
