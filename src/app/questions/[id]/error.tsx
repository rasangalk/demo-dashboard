'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className='container mx-auto py-6'>
      <Card>
        <CardContent className='p-6 text-center'>
          <h2 className='text-xl font-semibold mb-4'>Something went wrong</h2>
          <p className='mb-4 text-red-500'>{error.message}</p>
          <div className='flex justify-center space-x-4'>
            <Button onClick={reset} variant='outline'>
              Try again
            </Button>
            <Button asChild>
              <Link href='/questions'>Back to Questions</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
