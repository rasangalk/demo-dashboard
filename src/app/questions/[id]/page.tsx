'use client';

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

export default function ViewQuestionPage() {
  const params = useParams();
  const router = useRouter();
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchQuestion() {
      try {
        setLoading(true);
        console.log('Params in view page:', params);

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
  }, [params.id, router]);

  const handleEdit = () => {
    router.push(`/questions/${params.id}/edit`);
  };

  const handleBack = () => {
    router.push('/questions');
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
            <Button onClick={handleBack} className='mt-4'>
              Back to Questions
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='container mx-auto py-6'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-3xl font-bold'>View Question</h1>
        <div className='space-x-2'>
          <Button variant='outline' onClick={handleBack}>
            Back
          </Button>
          <Button onClick={handleEdit}>Edit Question</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Question Details</CardTitle>
          <CardDescription>View the details of this question</CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div>
            <h3 className='text-lg font-medium mb-2'>Question Text</h3>
            <p className='p-3 bg-muted rounded-md'>{question.text}</p>
          </div>

          <div>
            <h3 className='text-lg font-medium mb-2'>Subject</h3>
            <p className='p-3 bg-muted rounded-md'>
              {question.subModule?.module?.subject?.name}
            </p>
          </div>

          <div>
            <h3 className='text-lg font-medium mb-2'>Module</h3>
            <p className='p-3 bg-muted rounded-md'>
              {question.subModule?.module?.name}
            </p>
          </div>

          <div>
            <h3 className='text-lg font-medium mb-2'>Sub-Module</h3>
            <p className='p-3 bg-muted rounded-md'>
              {question.subModule?.name}
            </p>
          </div>

          <div>
            <h3 className='text-lg font-medium mb-2'>Answers</h3>
            <div className='space-y-2'>
              {question.answers.map((answer) => (
                <div
                  key={answer.id}
                  className={`p-3 rounded-md ${
                    answer.isCorrect
                      ? 'bg-green-100 dark:bg-green-900'
                      : 'bg-muted'
                  }`}
                >
                  <div className='flex items-start'>
                    <div className='flex-1'>
                      <p>{answer.text}</p>
                    </div>
                    {answer.isCorrect && (
                      <span className='text-green-600 dark:text-green-400 font-medium'>
                        Correct Answer
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
