'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/data-table/data-table';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { PaginationControls } from '@/components/data-table/pagination-controls';
import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { useRouter } from 'next/navigation';

interface Question {
  id: number;
  text: string;
  subModule: {
    id: number;
    name: string;
    module: {
      id: number;
      name: string;
      subject: {
        id: number;
        name: string;
      };
    };
  };
  answers: {
    id: number;
    text: string;
    isCorrect: boolean;
  }[];
  createdAt: string;
  updatedAt: string;
}

const columns: ColumnDef<Question>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'text',
    header: 'Question',
    cell: ({ row }) => {
      const text = row.original.text;
      return (
        <div className='max-w-md truncate' title={text}>
          {text}
        </div>
      );
    },
  },
  {
    header: 'Subject',
    cell: ({ row }) => (
      <div className='max-w-[150px] truncate'>
        <Link
          href={`/subjects/${row.original.subModule.module.subject.id}`}
          className='text-blue-600 hover:underline'
        >
          {row.original.subModule.module.subject.name}
        </Link>
      </div>
    ),
  },
  {
    header: 'Module',
    cell: ({ row }) => (
      <div className='max-w-[150px] truncate'>
        <Link
          href={`/modules/${row.original.subModule.module.id}`}
          className='text-blue-600 hover:underline'
        >
          {row.original.subModule.module.name}
        </Link>
      </div>
    ),
  },
  {
    header: 'Sub-Module',
    cell: ({ row }) => (
      <div className='max-w-[150px] truncate'>
        <Link
          href={`/submodules/${row.original.subModule.id}`}
          className='text-blue-600 hover:underline'
        >
          {row.original.subModule.name}
        </Link>
      </div>
    ),
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const question = row.original;
      return (
        <div className='flex space-x-2'>
          <Button asChild size='sm' variant='outline'>
            <Link href={`/questions/${question.id}`}>View</Link>
          </Button>
          <Button asChild size='sm' variant='outline'>
            <Link href={`/questions/${question.id}/edit`}>Edit</Link>
          </Button>
          <DeleteButton id={question.id} />
        </div>
      );
    },
  },
];

function DeleteButton({ id }: { id: number }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this question?')) {
      setIsDeleting(true);
      try {
        const response = await fetch(`/api/questions/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          router.refresh();
        } else {
          alert('Failed to delete question');
        }
      } catch (error) {
        console.error('Error deleting question:', error);
        alert('An error occurred while deleting the question');
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

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  // Search disabled temporarily

  useEffect(() => {
    let cancelled = false;
    const fetchQuestions = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams({
          page: String(page),
          pageSize: String(pageSize),
        });
        // search removed
        const response = await fetch(`/api/questions?${params.toString()}`, {
          credentials: 'include',
        });
        if (!response.ok) {
          if (!cancelled)
            console.error('Failed to fetch questions', response.status);
          return;
        }
        const json = await response.json();
        if (!cancelled) {
          setQuestions(Array.isArray(json?.data) ? json.data : []);
          setTotal(json.total || 0);
          setTotalPages(json.totalPages || 1);
        }
      } catch (error: any) {
        if (!cancelled) console.error('Error fetching questions:', error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    fetchQuestions();
    return () => {
      cancelled = true;
    };
  }, [page, pageSize]);

  return (
    <div className='space-y-6'>
      <PageHeader
        title='Questions'
        description='Manage the questions in your question bank'
      >
        <Button asChild>
          <Link href='/questions/create'>Add Question</Link>
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
          <p>Loading questions...</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={questions}
          emptyMessage='No questions found. Create your first question to get started.'
        />
      )}
    </div>
  );
}
