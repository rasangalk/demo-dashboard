'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface SubModule {
  id: number;
  name: string;
  description: string | null;
  moduleId: number;
  module: {
    id: number;
    name: string;
    subjectId: number;
    subject: { id: number; name: string };
  };
  createdAt: string;
  updatedAt: string;
}

export default function ViewSubModulePage() {
  const routeParams = useParams() as { id: string };
  const router = useRouter();
  const [subModule, setSubModule] = useState<SubModule | null>(null);
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
      } catch (e) {
        router.push('/submodules');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSubModule();
  }, [routeParams.id, router]);

  const handleDelete = async () => {
    if (confirm('Delete this sub-module and its questions?')) {
      try {
        const res = await fetch(`/api/submodules/${routeParams.id}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          router.push('/submodules');
          router.refresh();
        } else {
          alert('Failed to delete sub-module');
        }
      } catch (e) {
        alert('Error deleting sub-module');
      }
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
      <PageHeader title={subModule.name} description='View sub-module details'>
        <div className='flex space-x-2'>
          <Button variant='outline' asChild>
            <Link href={`/submodules/${routeParams.id}/edit`}>Edit</Link>
          </Button>
          <Button variant='destructive' onClick={handleDelete}>
            Delete
          </Button>
          <Button variant='outline' asChild>
            <Link href='/submodules'>Back</Link>
          </Button>
        </div>
      </PageHeader>
      <div className='space-y-4'>
        <div>
          <h3 className='text-lg font-semibold mb-1'>Description</h3>
          <p>{subModule.description || 'No description'}</p>
        </div>
        <div>
          <h3 className='text-lg font-semibold mb-1'>Module</h3>
          <p>{subModule.module.name}</p>
        </div>
        <div>
          <h3 className='text-lg font-semibold mb-1'>Subject</h3>
          <p>{subModule.module.subject.name}</p>
        </div>
      </div>
    </div>
  );
}
