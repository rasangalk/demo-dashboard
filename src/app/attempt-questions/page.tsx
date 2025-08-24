'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const attemptFormSchema = z.object({
  subject: z.string().min(1, { message: 'Subject is required' }),
  modules: z.array(z.string()).optional(),
  moduleSelectionType: z.enum(['all', 'specific']),
  subModules: z.array(z.string()).optional(),
  subModuleSelectionType: z.enum(['all', 'specific']),
  questionType: z.enum(['all', 'specific']),
  numberOfQuestions: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Number(val)), {
      message: 'Number of questions must be a valid number',
    }),
});

type AttemptFormValues = z.infer<typeof attemptFormSchema>;

interface Subject {
  id: number;
  name: string;
  description?: string;
}

interface Module {
  id: number;
  name: string;
  description?: string;
  subjectId: number;
}

interface SubModule {
  id: number;
  name: string;
  description?: string;
  moduleId: number;
}

export default function AttemptQuestionsPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [subModules, setSubModules] = useState<SubModule[]>([]);
  const [loading, setLoading] = useState(false);

  // Load subjects on initial render
  useEffect(() => {
    async function loadSubjects() {
      try {
        // Fetch first page of subjects (pagination API now returns an object { data, page, ... })
        const response = await fetch('/api/subjects?page=1&pageSize=100', {
          credentials: 'include',
        });
        if (!response.ok) {
          console.error(
            'Failed to load subjects',
            response.status,
            await response.text()
          );
          return;
        }
        const json = await response.json();
        setSubjects(Array.isArray(json?.data) ? json.data : []);
      } catch (error) {
        console.error('Failed to load subjects', error);
      }
    }

    loadSubjects();
  }, []);

  const form = useForm<AttemptFormValues>({
    resolver: zodResolver(attemptFormSchema),
    defaultValues: {
      subject: '',
      modules: [],
      moduleSelectionType: 'all',
      subModules: [],
      subModuleSelectionType: 'all',
      questionType: 'all',
      numberOfQuestions: '',
    },
  });

  const moduleSelectionType = form.watch('moduleSelectionType');
  const subModuleSelectionType = form.watch('subModuleSelectionType');
  const questionType = form.watch('questionType');
  const selectedSubject = form.watch('subject');

  // Load modules when subject changes
  useEffect(() => {
    if (selectedSubject) {
      async function loadModules() {
        try {
          // Use the new API endpoint
          const response = await fetch(
            `/api/modules-by-subject?subjectId=${selectedSubject}`
          );

          if (!response.ok) {
            console.error(
              `Error response: ${response.status}`,
              await response.text()
            );
            throw new Error(`Failed to fetch modules: ${response.status}`);
          }

          const data = await response.json();
          setModules(data);
          // Reset module selections when subject changes
          form.setValue('modules', []);
          form.setValue('subModules', []);
        } catch (error) {
          console.error('Failed to load modules', error);
          // Show a user-friendly error
          alert('Failed to load modules. Please try again.');
        }
      }

      loadModules();
    }
  }, [selectedSubject, form]);

  // Load submodules when modules change
  useEffect(() => {
    const selectedModules = form.watch('modules') || [];

    if (selectedModules.length > 0) {
      async function loadSubModules() {
        try {
          // Use the new API endpoint for each module
          const requests = selectedModules.map((moduleId) =>
            fetch(`/api/submodules-by-module?moduleId=${moduleId}`)
              .then((res) => {
                if (!res.ok) {
                  throw new Error(`Failed to fetch submodules: ${res.status}`);
                }
                return res.json();
              })
              .catch(async (error) => {
                console.error(`Error for module ${moduleId}:`, error);
                return [];
              })
          );

          const results = await Promise.all(requests);
          // Flatten and deduplicate submodules from multiple modules
          const allSubModules = Array.from(
            new Set(results.flat().map((sm) => JSON.stringify(sm)))
          ).map((sm) => JSON.parse(sm));

          setSubModules(allSubModules);
          // Reset submodule selections when modules change
          form.setValue('subModules', []);
        } catch (error) {
          console.error('Failed to load submodules', error);
        }
      }

      loadSubModules();
    }
  }, [form]);

  const onSubmit = async (values: AttemptFormValues) => {
    setLoading(true);
    try {
      // Prepare data for the quiz
      const quizParams = new URLSearchParams();

      quizParams.append('subject', values.subject);

      if (values.moduleSelectionType === 'all') {
        quizParams.append('allModules', 'true');
      } else {
        values.modules?.forEach((moduleId) => {
          quizParams.append('modules', moduleId);
        });
      }

      if (values.subModuleSelectionType === 'all') {
        quizParams.append('allSubModules', 'true');
      } else {
        values.subModules?.forEach((subModuleId) => {
          quizParams.append('subModules', subModuleId);
        });
      }

      if (values.questionType === 'all') {
        quizParams.append('allQuestions', 'true');
      } else {
        quizParams.append(
          'numberOfQuestions',
          values.numberOfQuestions || '10'
        );
      }

      // Navigate to the quiz page with parameters
      router.push(`/quiz?${quizParams.toString()}`);
    } catch (error) {
      console.error('Error starting quiz', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='container mx-auto py-6'>
      <h1 className='text-3xl font-bold mb-6'>Attempt Questions</h1>

      <Card>
        <CardHeader>
          <CardTitle>Question Selection</CardTitle>
          <CardDescription>
            Select the subjects, modules, and sub-modules you want to practice
            with
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
              {/* Subject Selection */}
              <FormField
                control={form.control}
                name='subject'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select a subject' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Array.isArray(subjects) &&
                          subjects.map((subject: Subject) => (
                            <SelectItem
                              key={subject.id}
                              value={String(subject.id)}
                            >
                              {subject.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Module Selection Type */}
              <FormField
                control={form.control}
                name='moduleSelectionType'
                render={({ field }) => (
                  <FormItem className='space-y-3'>
                    <FormLabel>Module Selection</FormLabel>
                    <div className='flex space-x-4'>
                      <FormItem className='flex items-center space-x-2'>
                        <FormControl>
                          <Checkbox
                            checked={field.value === 'all'}
                            onCheckedChange={() =>
                              form.setValue('moduleSelectionType', 'all')
                            }
                          />
                        </FormControl>
                        <FormLabel className='font-normal'>
                          All Modules
                        </FormLabel>
                      </FormItem>
                      <FormItem className='flex items-center space-x-2'>
                        <FormControl>
                          <Checkbox
                            checked={field.value === 'specific'}
                            onCheckedChange={() =>
                              form.setValue('moduleSelectionType', 'specific')
                            }
                          />
                        </FormControl>
                        <FormLabel className='font-normal'>
                          Specific Modules
                        </FormLabel>
                      </FormItem>
                    </div>
                  </FormItem>
                )}
              />

              {/* Specific Module Selection */}
              {moduleSelectionType === 'specific' && (
                <FormField
                  control={form.control}
                  name='modules'
                  render={() => (
                    <FormItem>
                      <div className='mb-4'>
                        <FormLabel className='text-base'>
                          Select Modules
                        </FormLabel>
                      </div>
                      <div className='grid grid-cols-2 gap-4'>
                        {modules.map((module: Module) => (
                          <FormItem
                            key={module.id}
                            className='flex flex-row items-start space-x-3 space-y-0'
                          >
                            <FormControl>
                              <Checkbox
                                checked={form
                                  .watch('modules')
                                  ?.includes(String(module.id))}
                                onCheckedChange={(checked) => {
                                  const currentModules =
                                    form.watch('modules') || [];
                                  if (checked) {
                                    form.setValue('modules', [
                                      ...currentModules,
                                      String(module.id),
                                    ]);
                                  } else {
                                    form.setValue(
                                      'modules',
                                      currentModules.filter(
                                        (id) => id !== String(module.id)
                                      )
                                    );
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel className='font-normal'>
                              {module.name}
                            </FormLabel>
                          </FormItem>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Sub-Module Selection Type */}
              {(moduleSelectionType === 'specific' &&
                (form.watch('modules') || []).length > 0) ||
              moduleSelectionType === 'all' ? (
                <FormField
                  control={form.control}
                  name='subModuleSelectionType'
                  render={({ field }) => (
                    <FormItem className='space-y-3'>
                      <FormLabel>Sub-Module Selection</FormLabel>
                      <div className='flex space-x-4'>
                        <FormItem className='flex items-center space-x-2'>
                          <FormControl>
                            <Checkbox
                              checked={field.value === 'all'}
                              onCheckedChange={() =>
                                form.setValue('subModuleSelectionType', 'all')
                              }
                            />
                          </FormControl>
                          <FormLabel className='font-normal'>
                            All Sub-Modules
                          </FormLabel>
                        </FormItem>
                        <FormItem className='flex items-center space-x-2'>
                          <FormControl>
                            <Checkbox
                              checked={field.value === 'specific'}
                              onCheckedChange={() =>
                                form.setValue(
                                  'subModuleSelectionType',
                                  'specific'
                                )
                              }
                            />
                          </FormControl>
                          <FormLabel className='font-normal'>
                            Specific Sub-Modules
                          </FormLabel>
                        </FormItem>
                      </div>
                    </FormItem>
                  )}
                />
              ) : null}

              {/* Specific Sub-Module Selection */}
              {subModuleSelectionType === 'specific' && (
                <FormField
                  control={form.control}
                  name='subModules'
                  render={() => (
                    <FormItem>
                      <div className='mb-4'>
                        <FormLabel className='text-base'>
                          Select Sub-Modules
                        </FormLabel>
                      </div>
                      <div className='grid grid-cols-2 gap-4'>
                        {subModules.map((subModule: SubModule) => (
                          <FormItem
                            key={subModule.id}
                            className='flex flex-row items-start space-x-3 space-y-0'
                          >
                            <FormControl>
                              <Checkbox
                                checked={form
                                  .watch('subModules')
                                  ?.includes(String(subModule.id))}
                                onCheckedChange={(checked) => {
                                  const currentSubModules =
                                    form.watch('subModules') || [];
                                  if (checked) {
                                    form.setValue('subModules', [
                                      ...currentSubModules,
                                      String(subModule.id),
                                    ]);
                                  } else {
                                    form.setValue(
                                      'subModules',
                                      currentSubModules.filter(
                                        (id) => id !== String(subModule.id)
                                      )
                                    );
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel className='font-normal'>
                              {subModule.name}
                            </FormLabel>
                          </FormItem>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Question Selection Type */}
              <FormField
                control={form.control}
                name='questionType'
                render={({ field }) => (
                  <FormItem className='space-y-3'>
                    <FormLabel>Question Selection</FormLabel>
                    <div className='flex space-x-4'>
                      <FormItem className='flex items-center space-x-2'>
                        <FormControl>
                          <Checkbox
                            checked={field.value === 'all'}
                            onCheckedChange={() =>
                              form.setValue('questionType', 'all')
                            }
                          />
                        </FormControl>
                        <FormLabel className='font-normal'>
                          All Questions
                        </FormLabel>
                      </FormItem>
                      <FormItem className='flex items-center space-x-2'>
                        <FormControl>
                          <Checkbox
                            checked={field.value === 'specific'}
                            onCheckedChange={() =>
                              form.setValue('questionType', 'specific')
                            }
                          />
                        </FormControl>
                        <FormLabel className='font-normal'>
                          Specific Number
                        </FormLabel>
                      </FormItem>
                    </div>
                  </FormItem>
                )}
              />

              {/* Number of Questions */}
              {questionType === 'specific' && (
                <FormField
                  control={form.control}
                  name='numberOfQuestions'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Questions</FormLabel>
                      <FormControl>
                        <Input type='number' placeholder='10' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <Button type='submit' disabled={loading}>
                {loading ? 'Loading...' : 'Start Quiz'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
