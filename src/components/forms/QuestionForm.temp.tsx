'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

// Define answer schema
const answerSchema = z.object({
  text: z.string().min(1, 'Answer text is required'),
  isCorrect: z.boolean().default(false),
});

// Define question schema
const questionSchema = z.object({
  text: z.string().min(1, 'Question text is required'),
  subjectId: z.string().min(1, 'Subject is required'),
  moduleId: z.string().min(1, 'Module is required'),
  subModuleId: z.string().min(1, 'Sub-Module is required'),
  answers: z
    .array(answerSchema)
    .min(2, 'At least 2 answers are required')
    .refine((answers) => answers.some((answer) => answer.isCorrect), {
      message: 'At least one answer must be marked as correct',
    }),
});

// Get type from schema
type QuestionFormValues = z.infer<typeof questionSchema>;

// Interfaces for data
interface Subject {
  id: number;
  name: string;
}

interface Module {
  id: number;
  name: string;
  subjectId: number;
}

interface SubModule {
  id: number;
  name: string;
  moduleId: number;
}

// Props interface
interface QuestionFormProps {
  initialData?: {
    id?: number;
    text: string;
    subModuleId: number;
    answers: {
      id: number;
      text: string;
      isCorrect: boolean;
    }[];
  };
  initialSelection?: {
    subjectId: string;
    moduleId: string;
    subModuleId: string;
  } | null;
  onSubmit: (data: QuestionFormValues) => void;
  onCreateAnother?: (data: QuestionFormValues) => void;
}

export function QuestionForm({
  initialData,
  initialSelection,
  onSubmit,
  onCreateAnother,
}: QuestionFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [subModules, setSubModules] = useState<SubModule[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>(
    initialSelection?.subjectId || ''
  );
  const [selectedModule, setSelectedModule] = useState<string>(
    initialSelection?.moduleId || ''
  );

  // Initialize form with React Hook Form
  const form = useForm({
    resolver: zodResolver(questionSchema),
    defaultValues: initialData
      ? {
          text: initialData.text,
          subjectId: '',
          moduleId: '',
          subModuleId: String(initialData.subModuleId),
          answers: initialData.answers.map((answer) => ({
            text: answer.text,
            isCorrect: answer.isCorrect,
          })),
        }
      : {
          text: '',
          subjectId: initialSelection?.subjectId || '',
          moduleId: initialSelection?.moduleId || '',
          subModuleId: initialSelection?.subModuleId || '',
          answers: [
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
          ],
        },
  });

  // Setup field array for dynamic answers
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'answers',
  });

  // Fetch subjects on component mount
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch('/api/subjects');
        if (response.ok) {
          const data = await response.json();
          setSubjects(data);
        }
      } catch (error) {
        console.error('Error fetching subjects:', error);
      }
    };

    fetchSubjects();
  }, []);

  // Set initial state from initialSelection
  useEffect(() => {
    if (initialSelection) {
      setSelectedSubject(initialSelection.subjectId);
      setSelectedModule(initialSelection.moduleId);
    }
  }, [initialSelection]);

  // Fetch modules when subject changes
  useEffect(() => {
    if (selectedSubject) {
      const fetchModules = async () => {
        try {
          const response = await fetch(
            `/api/modules?subjectId=${selectedSubject}`
          );
          if (response.ok) {
            const data = await response.json();
            setModules(data);

            // If initialSelection has moduleId, keep it
            if (
              initialSelection?.moduleId &&
              initialSelection.subjectId === selectedSubject
            ) {
              form.setValue('moduleId', initialSelection.moduleId);
            } else {
              form.setValue('moduleId', '');
            }
          }
        } catch (error) {
          console.error('Error fetching modules:', error);
        }
      };

      fetchModules();
    } else {
      setModules([]);
      form.setValue('moduleId', '');
      form.setValue('subModuleId', '');
    }
  }, [selectedSubject, form, initialSelection]);

  // Fetch submodules when module changes
  useEffect(() => {
    if (selectedModule) {
      const fetchSubModules = async () => {
        try {
          const response = await fetch(
            `/api/submodules?moduleId=${selectedModule}`
          );
          if (response.ok) {
            const data = await response.json();
            setSubModules(data);

            // If initialSelection has subModuleId, keep it
            if (
              initialSelection?.subModuleId &&
              initialSelection.moduleId === selectedModule
            ) {
              form.setValue('subModuleId', initialSelection.subModuleId);
            } else {
              form.setValue('subModuleId', '');
            }
          }
        } catch (error) {
          console.error('Error fetching submodules:', error);
        }
      };

      fetchSubModules();
    } else {
      setSubModules([]);
      form.setValue('subModuleId', '');
    }
  }, [selectedModule, form, initialSelection]);

  // Handle form submission
  const onFormSubmit = form.handleSubmit(async (data) => {
    setIsLoading(true);
    try {
      await onSubmit(data);
    } finally {
      setIsLoading(false);
    }
  });

  // Handle creating another question
  const handleCreateAnother = async (data: QuestionFormValues) => {
    setIsLoading(true);
    try {
      if (onCreateAnother) {
        await onCreateAnother(data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={onFormSubmit} className='space-y-6'>
        <div className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <FormField
              control={form.control}
              name='subjectId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedSubject(value);
                    }}
                    value={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select a subject' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={String(subject.id)}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='moduleId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Module</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedModule(value);
                    }}
                    value={field.value}
                    disabled={isLoading || modules.length === 0}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select a module' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {modules.map((module) => (
                        <SelectItem key={module.id} value={String(module.id)}>
                          {module.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='subModuleId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sub-Module</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoading || subModules.length === 0}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select a sub-module' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subModules.map((subModule) => (
                        <SelectItem
                          key={subModule.id}
                          value={String(subModule.id)}
                        >
                          {subModule.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name='text'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Question Text</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='Enter your question'
                    {...field}
                    rows={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='space-y-2'>
          <Label>Answers</Label>
          <div className='space-y-4'>
            {fields.map((field, index) => (
              <div key={field.id} className='border-b pb-4'>
                <div className='flex items-start gap-4'>
                  <div className='flex-1'>
                    <FormField
                      control={form.control}
                      name={`answers.${index}.text`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              placeholder={`Answer ${index + 1}`}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className='flex items-center space-x-2 pt-2'>
                    <FormField
                      control={form.control}
                      name={`answers.${index}.isCorrect`}
                      render={({ field }) => (
                        <FormItem className='flex items-center space-x-2'>
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <Label
                            htmlFor={`answer-${index}-correct`}
                            className='text-sm'
                          >
                            Correct
                          </Label>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className='flex flex-col sm:flex-row gap-4 mt-6'>
          <Button type='submit' className='flex-1' disabled={isLoading}>
            {isLoading
              ? 'Saving...'
              : initialData?.id
              ? 'Update Question'
              : 'Create Question'}
          </Button>

          {onCreateAnother && !initialData?.id && (
            <Button
              type='button'
              onClick={form.handleSubmit((data) => {
                if (onCreateAnother) onCreateAnother(data);
              })}
              variant='secondary'
              className='flex-1'
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Create & Add Another'}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
