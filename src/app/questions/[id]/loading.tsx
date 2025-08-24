'use client';

import { Card, CardContent } from '@/components/ui/card';

export default function Loading() {
  return (
    <div className='container mx-auto py-6'>
      <Card>
        <CardContent className='p-6'>
          <div className='flex items-center justify-center h-64'>
            <p>Loading question...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
