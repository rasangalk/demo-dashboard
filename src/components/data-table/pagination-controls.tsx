'use client';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

interface PaginationControlsProps {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  isLoading?: boolean;
}

export function PaginationControls({
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
  isLoading,
}: PaginationControlsProps) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between py-2'>
      <div className='flex flex-col sm:flex-row sm:items-center gap-4 w-full md:w-auto'>
        <div className='flex items-center gap-2'>
          <span className='text-sm text-muted-foreground'>Rows</span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => onPageSizeChange(parseInt(v))}
            disabled={isLoading}
          >
            <SelectTrigger className='w-20'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 25, 50, 100].map((sz) => (
                <SelectItem key={sz} value={String(sz)}>
                  {sz}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className='flex items-center gap-2'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            disabled={page <= 1 || isLoading}
            onClick={() => onPageChange(1)}
          >
            {'<<'}
          </Button>
          <Button
            type='button'
            variant='outline'
            size='sm'
            disabled={page <= 1 || isLoading}
            onClick={() => onPageChange(page - 1)}
          >
            {'<'}
          </Button>
          <span className='text-sm'>
            Page {page} / {totalPages}
          </span>
          <Button
            type='button'
            variant='outline'
            size='sm'
            disabled={page >= totalPages || isLoading}
            onClick={() => onPageChange(page + 1)}
          >
            {'>'}
          </Button>
          <Button
            type='button'
            variant='outline'
            size='sm'
            disabled={page >= totalPages || isLoading}
            onClick={() => onPageChange(totalPages)}
          >
            {'>>'}
          </Button>
        </div>
        <div className='text-xs text-muted-foreground min-w-[140px] text-right'>
          Showing {from}-{to} of {total}
        </div>
      </div>
    </div>
  );
}
