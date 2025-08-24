'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { SubjectForm } from '@/components/forms/SubjectForm';
import { Button } from '@/components/ui/button';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useEffect, useState } from 'react';

export default function EditSubjectPage() {
  const routeParams = useParams() as { id: string };
  const router = useRouter();
  const [subject, setSubject] = useState<{
    id: number;
    name: string;
    description?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSubject = async () => {
      try {
        const response = await fetch(`/api/subjects/${routeParams.id}`);
        if (response.ok) {
          const data = await response.json();
          setSubject(data);
        } else {
          console.error('Failed to fetch subject');
          router.push('/subjects');
        }
      } catch (error) {
        console.error('Error fetching subject:', error);
        router.push('/subjects');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubject();
  }, [routeParams.id, router]);

  const handleSubmit = async (data: { name: string; description?: string }) => {
    try {
      const response = await fetch(`/api/subjects/${routeParams.id}`, {
        method: 'PUT',
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
          `Failed to update subject: ${errorData.error || 'Unknown error'}`
        );
      }
    } catch (error) {
      console.error('Error updating subject:', error);
      alert('An error occurred while updating the subject');
    }
  };

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <p>Loading subject...</p>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className='flex justify-center items-center h-64'>
        <p>Subject not found</p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <PageHeader title='Edit Subject' description='Update subject details'>
        <div className='flex space-x-2'>
          <Button variant='outline' asChild>
            <Link href={`/subjects/${routeParams.id}`}>View</Link>
          </Button>
          <Button variant='outline' asChild>
            <Link href='/subjects'>Cancel</Link>
          </Button>
        </div>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>Subject Details</CardTitle>
          <CardDescription>
            Update the details for this subject.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SubjectForm initialData={subject} onSubmit={handleSubmit} />
        </CardContent>
      </Card>
    </div>
  );
}
