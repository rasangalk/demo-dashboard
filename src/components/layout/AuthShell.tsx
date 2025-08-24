'use client';

import { useEffect, useState } from 'react';
import Sidebar from './Sidebar';

// Lightweight client guard to complement middleware; also hides sidebar on /login
export default function AuthShell({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    const pathname = window.location.pathname;
    if (pathname === '/login') {
      setAuthed(false);
      setReady(true);
      return;
    }
    fetch('/api/auth/me', { cache: 'no-store' })
      .then((r) => r.json().catch(() => null))
      .then((data) => {
        if (data?.authenticated) {
          setAuthed(true);
        } else {
          window.location.href =
            '/login?redirect=' + encodeURIComponent(pathname);
        }
      })
      .finally(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <div className='min-h-screen flex items-center justify-center text-sm text-muted-foreground'>
        Checking session...
      </div>
    );
  }

  if (!authed && window.location.pathname === '/login') {
    return <>{children}</>;
  }

  if (!authed) return null; // redirect in progress

  return (
    <div className='flex'>
      <Sidebar />
      <main className='flex-1 p-8 overflow-auto'>{children}</main>
    </div>
  );
}
