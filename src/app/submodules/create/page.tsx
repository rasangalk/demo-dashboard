'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { SubModuleForm } from '@/components/forms/SubModuleForm';
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

export default function CreateSubModulePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const moduleId = searchParams.get('moduleId');
  const [initialModuleId, setInitialModuleId] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    if (moduleId) {
      setInitialModuleId(moduleId);
    }
  }, [moduleId]);

  const handleSubmit = async (data: {
    name: string;
    description?: string;
    moduleId: string;
  }) => {
    try {
      const response = await fetch('/api/submodules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        if (moduleId) {
          router.push(`/modules/${moduleId}`);
        } else {
          router.push('/submodules');
        }
        router.refresh();
      } else {
        const errorData = await response.json();
        alert(
          `Failed to create sub-module: ${errorData.error || 'Unknown error'}`
        );
      }
    } catch (error) {
      console.error('Error creating sub-module:', error);
      alert('An error occurred while creating the sub-module');
    }
  };

  return (
    <div className='space-y-6'>
      <PageHeader
        title='Create Sub-Module'
        description='Add a new sub-module to your question bank'
      >
        <Button variant='outline' asChild>
          <Link href={moduleId ? `/modules/${moduleId}` : '/submodules'}>
            Cancel
          </Link>
        </Button>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>Sub-Module Details</CardTitle>
          <CardDescription>
            Enter the details for the new sub-module. Sub-modules are grouped
            under modules.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SubModuleForm
            onSubmit={handleSubmit}
            initialData={
              initialModuleId
                ? {
                    name: '',
                    description: '',
                    moduleId: parseInt(initialModuleId),
                  }
                : undefined
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
