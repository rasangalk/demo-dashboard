'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { DataTable } from '@/components/data-table/data-table';
import { ColumnDef } from '@tanstack/react-table';

interface Subject {
  id: number;
  name: string;
  description: string | null;
  modules: Module[];
  createdAt: string;
  updatedAt: string;
}

interface Module {
  id: number;
  name: string;
  description: string | null;
  subjectId: number;
  createdAt: string;
  updatedAt: string;
}

const moduleColumns: ColumnDef<Module>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'name',
    header: 'Name',
  },
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
      const moduleItem = row.original;
      return (
        <div className='flex space-x-2'>
          <Button asChild size='sm' variant='outline'>
            <Link href={`/modules/${moduleItem.id}`}>View</Link>
          </Button>
          <Button asChild size='sm' variant='outline'>
            <Link href={`/modules/${module.id}/edit`}>Edit</Link>
          </Button>
        </div>
      );
    },
  },
];

export default function ViewSubjectPage() {
  // Next.js future change: params will be a Promise for server components. Since this is a client component, use useParams().
  const routeParams = useParams() as { id: string };
  const router = useRouter();
  const [subject, setSubject] = useState<Subject | null>(null);
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

  const handleDelete = async () => {
    if (
      confirm(
        'Are you sure you want to delete this subject? This will also delete all modules and questions associated with this subject.'
      )
    ) {
      try {
        const response = await fetch(`/api/subjects/${routeParams.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          router.push('/subjects');
          router.refresh();
        } else {
          alert('Failed to delete subject');
        }
      } catch (error) {
        console.error('Error deleting subject:', error);
        alert('An error occurred while deleting the subject');
      }
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
      <PageHeader title={subject.name} description='View subject details'>
        <div className='flex space-x-2'>
          <Button variant='outline' asChild>
            <Link href={`/subjects/${routeParams.id}/edit`}>Edit</Link>
          </Button>
          <Button variant='destructive' onClick={handleDelete}>
            Delete
          </Button>
          <Button variant='outline' asChild>
            <Link href='/subjects'>Back</Link>
          </Button>
        </div>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>Subject Details</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div>
            <h3 className='font-medium'>Description</h3>
            <p>{subject.description || 'No description provided'}</p>
          </div>
          <div>
            <h3 className='font-medium'>Created At</h3>
            <p>{new Date(subject.createdAt).toLocaleString()}</p>
          </div>
          <div>
            <h3 className='font-medium'>Updated At</h3>
            <p>{new Date(subject.updatedAt).toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>

      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h2 className='text-2xl font-bold'>Modules</h2>
          <Button asChild>
            <Link href={`/modules/create?subjectId=${subject.id}`}>
              Add Module
            </Link>
          </Button>
        </div>
        <DataTable
          columns={moduleColumns}
          data={subject.modules || []}
          emptyMessage='No modules found for this subject. Add a module to get started.'
        />
      </div>
    </div>
  );
}
