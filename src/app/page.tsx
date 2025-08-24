import { PageHeader } from '@/components/layout/PageHeader';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import prisma from '@/lib/db';

async function getStats() {
  // Get counts
  const subjectCount = await prisma.subject.count();
  const moduleCount = await prisma.module.count();
  const subModuleCount = await prisma.subModule.count();
  const questionCount = await prisma.question.count();

  // Get most recent items
  const recentSubjects = await prisma.subject.findMany({
    orderBy: { createdAt: 'desc' },
    take: 3,
    select: { id: true, name: true, createdAt: true },
  });

  const recentQuestions = await prisma.question.findMany({
    orderBy: { createdAt: 'desc' },
    take: 3,
    select: {
      id: true,
      text: true,
      createdAt: true,
      subModule: {
        select: {
          name: true,
          module: {
            select: {
              name: true,
              subject: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return {
    subjectCount,
    moduleCount,
    subModuleCount,
    questionCount,
    recentSubjects,
    recentQuestions,
  };
}

export default async function Home() {
  const {
    subjectCount,
    moduleCount,
    subModuleCount,
    questionCount,
    recentSubjects,
    recentQuestions,
  } = await getStats();

  return (
    <div className='space-y-8'>
      <PageHeader
        title='Question Bank Admin Dashboard'
        description='Manage your subjects, modules, sub-modules, and questions'
      />

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <DashboardCard
          title='Subjects'
          description='Manage subjects'
          count={subjectCount.toString()}
          href='/subjects'
        />

        <DashboardCard
          title='Modules'
          description='Manage modules'
          count={moduleCount.toString()}
          href='/modules'
        />

        <DashboardCard
          title='Sub-Modules'
          description='Manage sub-modules'
          count={subModuleCount.toString()}
          href='/submodules'
        />

        <DashboardCard
          title='Questions'
          description='Manage questions'
          count={questionCount.toString()}
          href='/questions'
        />
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle>Recent Subjects</CardTitle>
            <CardDescription>
              Recently added subjects in your question bank
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentSubjects.length > 0 ? (
              <div className='space-y-4'>
                {recentSubjects.map((subject) => (
                  <div
                    key={subject.id}
                    className='flex justify-between items-center border-b pb-2'
                  >
                    <Link
                      href={`/subjects/${subject.id}`}
                      className='text-blue-600 hover:underline'
                    >
                      {subject.name}
                    </Link>
                    <span className='text-sm text-gray-500'>
                      {new Date(subject.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className='text-gray-500'>No subjects created yet</p>
            )}
          </CardContent>
          <CardFooter>
            <Button asChild variant='outline' className='w-full'>
              <Link href='/subjects'>View All Subjects</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Questions</CardTitle>
            <CardDescription>
              Recently added questions in your question bank
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentQuestions.length > 0 ? (
              <div className='space-y-4'>
                {recentQuestions.map((question) => (
                  <div key={question.id} className='border-b pb-2'>
                    <Link
                      href={`/questions/${question.id}`}
                      className='text-blue-600 hover:underline block'
                    >
                      {question.text.length > 50
                        ? `${question.text.substring(0, 50)}...`
                        : question.text}
                    </Link>
                    <div className='text-sm text-gray-500 mt-1'>
                      <span>
                        {question.subModule.module.subject.name} &gt;{' '}
                      </span>
                      <span>{question.subModule.module.name} &gt; </span>
                      <span>{question.subModule.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className='text-gray-500'>No questions created yet</p>
            )}
          </CardContent>
          <CardFooter>
            <Button asChild variant='outline' className='w-full'>
              <Link href='/questions'>View All Questions</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

interface DashboardCardProps {
  title: string;
  description: string;
  count: string;
  href: string;
}

function DashboardCard({
  title,
  description,
  count,
  href,
}: DashboardCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className='text-3xl font-bold'>{count}</p>
      </CardContent>
      <CardFooter>
        <Button asChild className='w-full'>
          <Link href={href}>Manage {title}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
