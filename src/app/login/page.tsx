'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already have session cookie, redirect (client heuristic)
  useEffect(() => {
    // Simple check via lightweight ping
    fetch('/api/auth/me', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.authenticated) router.replace('/');
      })
      .catch(() => {});
  }, [router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      });
      if (res.ok) {
        router.replace('/');
      } else {
        const data = await res.json();
        setError(data.error || 'Login failed');
      }
    } catch (_) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='h-[100vh] flex items-center justify-center p-4'>
      <Card className='w-full max-w-sm'>
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>Enter your credentials to continue</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className='space-y-4'>
            {error && (
              <div className='text-sm text-red-600 dark:text-red-400'>
                {error}
              </div>
            )}
            <div className='space-y-2'>
              <label className='text-sm font-medium block'>Username</label>
              <input
                className='w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-primary/30'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete='username'
                required
              />
            </div>
            <div className='space-y-2'>
              <label className='text-sm font-medium block'>Password</label>
              <input
                type='password'
                className='w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-primary/30'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete='current-password'
                required
              />
            </div>
          </CardContent>
          <CardFooter className='flex flex-col gap-2'>
            <Button type='submit' className='w-full mt-7' disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
            {/* Credential hint removed per request */}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
