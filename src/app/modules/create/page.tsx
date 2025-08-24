'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { ModuleForm } from '@/components/forms/ModuleForm';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useEffect, useState } from 'react';

export default function CreateModulePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subjectId = searchParams.get('subjectId');
  const [initialSubjectId, setInitialSubjectId] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    if (subjectId) {
      setInitialSubjectId(subjectId);
    }
  }, [subjectId]);

  const handleSubmit = async (data: {
    name: string;
    description?: string;
    subjectId: string;
  }) => {
    try {
      const response = await fetch('/api/modules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        if (subjectId) {
          router.push(`/subjects/${subjectId}`);
        } else {
          router.push('/modules');
        }
        router.refresh();
      } else {
        const errorData = await response.json();
        alert(`Failed to create module: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating module:', error);
      alert('An error occurred while creating the module');
    }
  };

  return (
    <div className='space-y-6'>
      <PageHeader
        title='Create Module'
        description='Add a new module to your question bank'
      >
        <Button variant='outline' asChild>
          <Link href={subjectId ? `/subjects/${subjectId}` : '/modules'}>
            Cancel
          </Link>
        </Button>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>Module Details</CardTitle>
          <CardDescription>
            Enter the details for the new module. Modules are grouped under
            subjects.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ModuleForm
            onSubmit={handleSubmit}
            initialData={
              initialSubjectId
                ? {
                    name: '',
                    description: '',
                    subjectId: parseInt(initialSubjectId),
                  }
                : undefined
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
