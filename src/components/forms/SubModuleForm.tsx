import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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

const subModuleSchema = z.object({
  name: z.string().min(1, 'Sub-Module name is required'),
  description: z.string().optional(),
  moduleId: z.string().min(1, 'Module is required'),
});

type SubModuleFormValues = z.infer<typeof subModuleSchema>;

interface Module {
  id: number;
  name: string;
  subject: {
    id: number;
    name: string;
  };
}

interface SubModuleFormProps {
  initialData?: {
    id?: number;
    name: string;
    description?: string;
    moduleId: number;
  };
  onSubmit: (data: SubModuleFormValues) => void;
}

export function SubModuleForm({ initialData, onSubmit }: SubModuleFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [modules, setModules] = useState<Module[]>([]);

  useEffect(() => {
    // Fetch modules
    const fetchModules = async () => {
      try {
        const response = await fetch('/api/modules');
        if (response.ok) {
          const data = await response.json();
          setModules(data);
        }
      } catch (error) {
        console.error('Error fetching modules:', error);
      }
    };

    fetchModules();
  }, []);

  const form = useForm<SubModuleFormValues>({
    resolver: zodResolver(subModuleSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          moduleId: String(initialData.moduleId),
        }
      : {
          name: '',
          description: '',
          moduleId: '',
        },
  });

  const handleSubmit = async (data: SubModuleFormValues) => {
    setIsLoading(true);
    try {
      await onSubmit(data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder='Sub-Module name' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='Sub-Module description (optional)'
                  {...field}
                />
              </FormControl>
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
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Select a module' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {modules.map((module) => (
                    <SelectItem key={module.id} value={String(module.id)}>
                      {module.name} ({module.subject.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type='submit' className='w-full' disabled={isLoading}>
          {isLoading
            ? 'Saving...'
            : initialData?.id
            ? 'Update Sub-Module'
            : 'Create Sub-Module'}
        </Button>
      </form>
    </Form>
  );
}
