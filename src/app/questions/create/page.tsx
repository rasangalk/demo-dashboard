'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { QuestionForm } from '@/components/forms/QuestionForm';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function CreateQuestionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subModuleId = searchParams.get('subModuleId');
  const [lastSelection, setLastSelection] = useState<{
    subjectId: string;
    moduleId: string;
    subModuleId: string;
  } | null>(null);
  const [formKey, setFormKey] = useState(0); // Used to reset form by changing the key

  const handleSubmit = async (
    data: {
      text: string;
      subjectId: string;
      moduleId: string;
      subModuleId: string;
      answers: { text: string; isCorrect: boolean }[];
    },
    createAnother: boolean = false
  ) => {
    try {
      // Save selection for potential next question
      if (createAnother) {
        setLastSelection({
          subjectId: data.subjectId,
          moduleId: data.moduleId,
          subModuleId: data.subModuleId,
        });
      }

      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: data.text,
          subModuleId: parseInt(data.subModuleId),
          answers: data.answers,
        }),
      });

      if (response.ok) {
        if (createAnother) {
          // Reset form by changing the key, but keep selection
          setFormKey((prev) => prev + 1);
        } else {
          // Navigate away
          if (subModuleId) {
            router.push(`/submodules/${subModuleId}`);
          } else {
            router.push('/questions');
          }
          router.refresh();
        }
      } else {
        const errorData = await response.json();
        alert(
          `Failed to create question: ${errorData.error || 'Unknown error'}`
        );
      }
    } catch (error) {
      console.error('Error creating question:', error);
      alert('An error occurred while creating the question');
    }
  };

  const handleCreateAnother = (data: {
    text: string;
    subjectId: string;
    moduleId: string;
    subModuleId: string;
    answers: { text: string; isCorrect: boolean }[];
  }) => {
    handleSubmit(data, true);
  };

  return (
    <div className='space-y-6'>
      <PageHeader
        title='Create Question'
        description='Add a new question to your question bank'
      >
        <Button variant='outline' asChild>
          <Link
            href={subModuleId ? `/submodules/${subModuleId}` : '/questions'}
          >
            Cancel
          </Link>
        </Button>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>Question Details</CardTitle>
          <CardDescription>
            Create a new question with multiple answers. You must select a
            subject, module, and sub-module for the question.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <QuestionForm
            key={formKey}
            onSubmit={handleSubmit}
            onCreateAnother={handleCreateAnother}
            initialSelection={lastSelection}
          />
        </CardContent>
      </Card>
    </div>
  );
}
