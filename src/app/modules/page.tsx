'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/data-table/data-table';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { PaginationControls } from '@/components/data-table/pagination-controls';
import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { useRouter } from 'next/navigation';

interface Module {
  id: number;
  name: string;
  description: string | null;
  subject: {
    id: number;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

const columns: ColumnDef<Module>[] = [
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
    accessorKey: 'subject.name',
    header: 'Subject',
    cell: ({ row }) => (
      <Link
        href={`/subjects/${row.original.subject.id}`}
        className='text-blue-600 hover:underline'
      >
        {row.original.subject.name}
      </Link>
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
            <Link href={`/modules/${moduleItem.id}/edit`}>Edit</Link>
          </Button>
          <DeleteButton id={moduleItem.id} />
        </div>
      );
    },
  },
];

function DeleteButton({ id }: { id: number }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this module?')) {
      setIsDeleting(true);
      try {
        const response = await fetch(`/api/modules/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          router.refresh();
        } else {
          alert('Failed to delete module');
        }
      } catch (error) {
        console.error('Error deleting module:', error);
        alert('An error occurred while deleting the module');
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

export default function ModulesPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  // Search disabled temporarily

  useEffect(() => {
    let cancelled = false;
    const fetchModules = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams({
          page: String(page),
          pageSize: String(pageSize),
        });
        // search removed
        const response = await fetch(`/api/modules?${params.toString()}`, {
          credentials: 'include',
        });
        if (!response.ok) {
          if (!cancelled)
            console.error('Failed to fetch modules', response.status);
          return;
        }
        const json = await response.json();
        if (!cancelled) {
          setModules(Array.isArray(json?.data) ? json.data : []);
          setTotal(json.total || 0);
          setTotalPages(json.totalPages || 1);
        }
      } catch (error: unknown) {
        if (!cancelled) console.error('Error fetching modules:', error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    fetchModules();
    return () => {
      cancelled = true;
    };
  }, [page, pageSize]);

  return (
    <div className='space-y-6'>
      <PageHeader
        title='Modules'
        description='Manage the modules in your question bank'
      >
        <Button asChild>
          <Link href='/modules/create'>Add Module</Link>
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
          <p>Loading modules...</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={modules}
          emptyMessage='No modules found. Create your first module to get started.'
        />
      )}
    </div>
  );
}
