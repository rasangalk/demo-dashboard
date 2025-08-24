'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { SubModuleForm } from '@/components/forms/SubModuleForm';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function EditSubModulePage() {
  const routeParams = useParams() as { id: string };
  const router = useRouter();
  const [subModule, setSubModule] = useState<{
    id: number;
    name: string;
    description?: string;
    moduleId: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSubModule = async () => {
      try {
        const response = await fetch(`/api/submodules/${routeParams.id}`);
        if (response.ok) {
          const data = await response.json();
          setSubModule(data);
        } else {
          router.push('/submodules');
        }
      } catch (_) {
        router.push('/submodules');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSubModule();
  }, [routeParams.id, router]);

  const handleSubmit = async (data: {
    name: string;
    description?: string;
    moduleId: string;
  }) => {
    try {
      const res = await fetch(`/api/submodules/${routeParams.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        router.push(`/submodules/${routeParams.id}`);
        router.refresh();
      } else {
        alert('Failed to update sub-module');
      }
    } catch (_) {
      alert('Error updating sub-module');
    }
  };

  if (isLoading)
    return (
      <div className='flex justify-center items-center h-64'>
        <p>Loading sub-module...</p>
      </div>
    );
  if (!subModule)
    return (
      <div className='flex justify-center items-center h-64'>
        <p>Sub-Module not found</p>
      </div>
    );

  return (
    <div className='space-y-6'>
      <PageHeader
        title='Edit Sub-Module'
        description='Update sub-module details'
      >
        <div className='flex space-x-2'>
          <Button variant='outline' asChild>
            <Link href={`/submodules/${routeParams.id}`}>View</Link>
          </Button>
          <Button variant='outline' asChild>
            <Link href='/submodules'>Cancel</Link>
          </Button>
        </div>
      </PageHeader>
      <SubModuleForm initialData={subModule} onSubmit={handleSubmit} />
    </div>
  );
}
