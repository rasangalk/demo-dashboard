'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { ModuleForm } from '@/components/forms/ModuleForm';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function EditModulePage() {
  const routeParams = useParams() as { id: string };
  const router = useRouter();
  const [moduleData, setModuleData] = useState<{
    id: number;
    name: string;
    description?: string;
    subjectId: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchModule = async () => {
      try {
        const response = await fetch(`/api/modules/${routeParams.id}`);
        if (response.ok) {
          const data = await response.json();
          setModuleData(data);
        } else {
          router.push('/modules');
        }
      } catch (e) {
        router.push('/modules');
      } finally {
        setIsLoading(false);
      }
    };
    fetchModule();
  }, [routeParams.id, router]);

  const handleSubmit = async (data: {
    name: string;
    description?: string;
    subjectId: string;
  }) => {
    try {
      const res = await fetch(`/api/modules/${routeParams.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        router.push(`/modules/${routeParams.id}`);
        router.refresh();
      } else {
        alert('Failed to update module');
      }
    } catch (e) {
      alert('Error updating module');
    }
  };

  if (isLoading)
    return (
      <div className='flex justify-center items-center h-64'>
        <p>Loading module...</p>
      </div>
    );
  if (!moduleData)
    return (
      <div className='flex justify-center items-center h-64'>
        <p>Module not found</p>
      </div>
    );

  return (
    <div className='space-y-6'>
      <PageHeader title='Edit Module' description='Update module details'>
        <div className='flex space-x-2'>
          <Button variant='outline' asChild>
            <Link href={`/modules/${routeParams.id}`}>View</Link>
          </Button>
          <Button variant='outline' asChild>
            <Link href='/modules'>Cancel</Link>
          </Button>
        </div>
      </PageHeader>
      <ModuleForm initialData={moduleData} onSubmit={handleSubmit} />
    </div>
  );
}
