'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { SubjectForm } from '@/components/forms/SubjectForm';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function CreateSubjectPage() {
  const router = useRouter();

  const handleSubmit = async (data: { name: string; description?: string }) => {
    try {
      const response = await fetch('/api/subjects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.push('/subjects');
        router.refresh();
      } else {
        const errorData = await response.json();
        alert(
          `Failed to create subject: ${errorData.error || 'Unknown error'}`
        );
      }
    } catch (error) {
      console.error('Error creating subject:', error);
      alert('An error occurred while creating the subject');
    }
  };

  return (
    <div className='space-y-6'>
      <PageHeader
        title='Create Subject'
        description='Add a new subject to your question bank'
      >
        <Button variant='outline' asChild>
          <Link href='/subjects'>Cancel</Link>
        </Button>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>Subject Details</CardTitle>
          <CardDescription>
            Enter the details for the new subject. Subjects are the top-level
            categories in your question bank.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SubjectForm onSubmit={handleSubmit} />
        </CardContent>
      </Card>
    </div>
  );
}
