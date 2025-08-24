'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/data-table/data-table';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { PaginationControls } from '@/components/data-table/pagination-controls';
import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { useRouter } from 'next/navigation';

interface SubModule {
  id: number;
  name: string;
  description: string | null;
  module: {
    id: number;
    name: string;
    subject: {
      id: number;
      name: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

const columns: ColumnDef<SubModule>[] = [
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
    header: 'Module',
    cell: ({ row }) => (
      <Link
        href={`/modules/${row.original.module.id}`}
        className='text-blue-600 hover:underline'
      >
        {row.original.module.name}
      </Link>
    ),
  },
  {
    header: 'Subject',
    cell: ({ row }) => (
      <Link
        href={`/subjects/${row.original.module.subject.id}`}
        className='text-blue-600 hover:underline'
      >
        {row.original.module.subject.name}
      </Link>
    ),
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const subModule = row.original;
      return (
        <div className='flex space-x-2'>
          <Button asChild size='sm' variant='outline'>
            <Link href={`/submodules/${subModule.id}`}>View</Link>
          </Button>
          <Button asChild size='sm' variant='outline'>
            <Link href={`/submodules/${subModule.id}/edit`}>Edit</Link>
          </Button>
          <DeleteButton id={subModule.id} />
        </div>
      );
    },
  },
];

function DeleteButton({ id }: { id: number }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this sub-module?')) {
      setIsDeleting(true);
      try {
        const response = await fetch(`/api/submodules/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          router.refresh();
        } else {
          alert('Failed to delete sub-module');
        }
      } catch (error) {
        console.error('Error deleting sub-module:', error);
        alert('An error occurred while deleting the sub-module');
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

export default function SubModulesPage() {
  const [subModules, setSubModules] = useState<SubModule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  // Search disabled temporarily

  useEffect(() => {
    let cancelled = false;
    const fetchSubModules = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams({
          page: String(page),
          pageSize: String(pageSize),
        });
        // search removed
        const response = await fetch(`/api/submodules?${params.toString()}`, {
          credentials: 'include',
        });
        if (!response.ok) {
          if (!cancelled)
            console.error('Failed to fetch sub-modules', response.status);
          return;
        }
        const json = await response.json();
        if (!cancelled) {
          setSubModules(Array.isArray(json?.data) ? json.data : []);
          setTotal(json.total || 0);
          setTotalPages(json.totalPages || 1);
        }
      } catch (error: unknown) {
        if (!cancelled) console.error('Error fetching sub-modules:', error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    fetchSubModules();
    return () => {
      cancelled = true;
    };
  }, [page, pageSize]);

  return (
    <div className='space-y-6'>
      <PageHeader
        title='Sub-Modules'
        description='Manage the sub-modules in your question bank'
      >
        <Button asChild>
          <Link href='/submodules/create'>Add Sub-Module</Link>
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
          <p>Loading sub-modules...</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={subModules}
          emptyMessage='No sub-modules found. Create your first sub-module to get started.'
        />
      )}
    </div>
  );
}
