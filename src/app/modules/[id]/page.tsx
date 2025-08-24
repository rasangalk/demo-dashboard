'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/data-table/data-table';
import { ColumnDef } from '@tanstack/react-table';

interface SubModule {
  id: number;
  name: string;
  description: string | null;
}

interface Module {
  id: number;
  name: string;
  description: string | null;
  subjectId: number;
  createdAt: string;
  updatedAt: string;
  subModules: SubModule[];
}

const subModuleColumns: ColumnDef<SubModule>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'name', header: 'Name' },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => (
      <div>{row.original.description || 'No description'}</div>
    ),
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const sm = row.original;
      return (
        <div className='flex space-x-2'>
          <Button asChild size='sm' variant='outline'>
            <Link href={`/submodules/${sm.id}`}>View</Link>
          </Button>
          <Button asChild size='sm' variant='outline'>
            <Link href={`/submodules/${sm.id}/edit`}>Edit</Link>
          </Button>
        </div>
      );
    },
  },
];

export default function ViewModulePage() {
  const routeParams = useParams() as { id: string };
  const router = useRouter();
  const [moduleData, setModuleData] = useState<Module | null>(null);
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
      } catch (_) {
        router.push('/modules');
      } finally {
        setIsLoading(false);
      }
    };
    fetchModule();
  }, [routeParams.id, router]);

  const handleDelete = async () => {
    if (confirm('Delete this module and its sub-modules?')) {
      try {
        const res = await fetch(`/api/modules/${routeParams.id}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          router.push('/modules');
          router.refresh();
        } else {
          alert('Failed to delete module');
        }
      } catch (_) {
        alert('Error deleting module');
      }
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
      <PageHeader title={moduleData.name} description='View module details'>
        <div className='flex space-x-2'>
          <Button variant='outline' asChild>
            <Link href={`/modules/${routeParams.id}/edit`}>Edit</Link>
          </Button>
          <Button variant='destructive' onClick={handleDelete}>
            Delete
          </Button>
          <Button variant='outline' asChild>
            <Link href='/modules'>Back</Link>
          </Button>
        </div>
      </PageHeader>
      <div>
        <h2 className='text-xl font-semibold mb-2'>Sub-Modules</h2>
        <DataTable
          columns={subModuleColumns}
          data={moduleData.subModules}
          emptyMessage='No sub-modules.'
        />
      </div>
    </div>
  );
}
