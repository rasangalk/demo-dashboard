'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/data-table/data-table';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { PaginationControls } from '@/components/data-table/pagination-controls';
import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { useRouter } from 'next/navigation';

interface Subject {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

const columns: ColumnDef<Subject>[] = [
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
      const subject = row.original;
      return (
        <div className='flex space-x-2'>
          <Button asChild size='sm' variant='outline'>
            <Link href={`/subjects/${subject.id}`}>View</Link>
          </Button>
          <Button asChild size='sm' variant='outline'>
            <Link href={`/subjects/${subject.id}/edit`}>Edit</Link>
          </Button>
          <DeleteButton id={subject.id} />
        </div>
      );
    },
  },
];

function DeleteButton({ id }: { id: number }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this subject?')) {
      setIsDeleting(true);
      try {
        const response = await fetch(`/api/subjects/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          router.refresh();
        } else {
          alert('Failed to delete subject');
        }
      } catch (error) {
        console.error('Error deleting subject:', error);
        alert('An error occurred while deleting the subject');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <Button
      size='sm'
      variant='destructive'
      onClick={handleDelete}
      disabled={isDeleting}
    >
      {isDeleting ? 'Deleting...' : 'Delete'}
    </Button>
  );
}

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  // Search disabled temporarily

  useEffect(() => {
    let cancelled = false;
    const fetchSubjects = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams({
          page: String(page),
          pageSize: String(pageSize),
        });
        // search removed
        const url = `/api/subjects?${params.toString()}`;
        const response = await fetch(url, { credentials: 'include' });
        if (!response.ok) {
          if (!cancelled)
            console.error('Failed to fetch subjects', response.status);
          return;
        }
        const json = await response.json();
        if (!cancelled) {
          setSubjects(Array.isArray(json?.data) ? json.data : []);
          setTotal(json.total || 0);
          setTotalPages(json.totalPages || 1);
        }
      } catch (error: any) {
        if (!cancelled) console.error('Error fetching subjects:', error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    fetchSubjects();
    return () => {
      cancelled = true;
    };
  }, [page, pageSize]);

  return (
    <div className='space-y-6'>
      <PageHeader
        title='Subjects'
        description='Manage the subjects in your question bank'
      >
        <Button asChild>
          <Link href='/subjects/create'>Add Subject</Link>
        </Button>
      </PageHeader>

      <PaginationControls
        page={page}
        pageSize={pageSize}
        total={total}
        totalPages={totalPages}
        onPageChange={(p) => setPage(p)}
        onPageSizeChange={(s) => {
          setPageSize(s);
          setPage(1);
        }}
        // search props removed
        isLoading={isLoading}
      />
      {isLoading ? (
        <div className='flex justify-center items-center h-64'>
          <p>Loading subjects...</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={subjects}
          emptyMessage='No subjects found. Create your first subject to get started.'
        />
      )}
    </div>
  );
}
