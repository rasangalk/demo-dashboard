'use client';

import { QuestionForm } from '@/components/forms/QuestionForm';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Answer {
  id: number;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: number;
  text: string;
  subModuleId: number;
  subModule: {
    id: number;
    name: string;
    moduleId: number;
    module: {
      id: number;
      name: string;
      subjectId: number;
      subject: {
        id: number;
        name: string;
      };
    };
  };
  answers: Answer[];
}

export default function EditQuestionPage() {
  const params = useParams();
  const router = useRouter();
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchQuestion() {
      try {
        setLoading(true);
        console.log('Params in edit page:', params);

        if (!params || typeof params.id !== 'string') {
          console.error('Invalid params:', params);
          throw new Error('Invalid question ID');
        }

        const response = await fetch(`/api/questions/${params.id}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch question: ${response.status}`);
        }

        const data = await response.json();
        setQuestion(data);
      } catch (error) {
        console.error('Error fetching question:', error);
        setError('Failed to load question. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchQuestion();
    }
  }, [params.id]);

  const handleBack = () => {
    router.push(`/questions/${params.id}`);
  };

  if (loading) {
    return (
      <div className='container mx-auto py-6'>
        <Card>
          <CardContent className='p-6'>
            <p>Loading question...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className='container mx-auto py-6'>
        <Card>
          <CardContent className='p-6'>
            <p className='text-red-500'>{error || 'Question not found'}</p>
            <Button onClick={() => router.push('/questions')} className='mt-4'>
              Back to Questions
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Transform question data for the form
  const initialData = {
    id: question.id,
    text: question.text,
    subModuleId: question.subModuleId,
    answers: question.answers.map((answer) => ({
      text: answer.text,
      isCorrect: answer.isCorrect,
      id: answer.id,
    })),
  };

  const initialSelection = {
    subjectId: String(question.subModule.module.subject.id),
    moduleId: String(question.subModule.module.id),
    subModuleId: String(question.subModule.id),
  };

  const handleSubmit = async (data: any) => {
    try {
      const response = await fetch(`/api/questions/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update question');
      }

      router.push(`/questions/${params.id}`);
    } catch (error) {
      console.error('Error updating question:', error);
      alert('Failed to update question. Please try again.');
    }
  };

  return (
    <div className='container mx-auto py-6'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-3xl font-bold'>Edit Question</h1>
        <Button variant='outline' onClick={handleBack}>
          Cancel
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Question</CardTitle>
          <CardDescription>Update the question details below</CardDescription>
        </CardHeader>
        <CardContent>
          <QuestionForm
            initialData={initialData}
            initialSelection={initialSelection}
            onSubmit={handleSubmit}
          />
        </CardContent>
      </Card>
    </div>
  );
}
