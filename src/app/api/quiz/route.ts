import prisma from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const subject = searchParams.get('subject');
    const allModules = searchParams.get('allModules') === 'true';
    const modules = searchParams.getAll('modules');
    const allSubModules = searchParams.get('allSubModules') === 'true';
    const subModules = searchParams.getAll('subModules');
    const allQuestions = searchParams.get('allQuestions') === 'true';
    const limit = searchParams.get('limit');

    // Build the where clause for the query
    const where: any = {};

    // Sub-module filter (primary filter)
    if (!allSubModules && subModules.length > 0) {
      where.subModuleId = {
        in: subModules.map((id) => parseInt(id)),
      };
    } else if (!allModules && modules.length > 0) {
      // If no specific submodules but we have modules, find questions for all submodules in these modules
      const relatedSubmodules = await prisma.subModule.findMany({
        where: {
          moduleId: {
            in: modules.map((id) => parseInt(id)),
          },
        },
        select: {
          id: true,
        },
      });

      where.subModuleId = {
        in: relatedSubmodules.map((sm) => sm.id),
      };
    } else if (subject) {
      // If no specific modules/submodules but we have a subject, find all related questions
      const relatedModules = await prisma.module.findMany({
        where: {
          subjectId: parseInt(subject),
        },
        select: {
          id: true,
        },
      });

      const relatedSubmodules = await prisma.subModule.findMany({
        where: {
          moduleId: {
            in: relatedModules.map((m) => m.id),
          },
        },
        select: {
          id: true,
        },
      });

      where.subModuleId = {
        in: relatedSubmodules.map((sm) => sm.id),
      };
    }

    // Fetch questions with real answers
    const questions = await prisma.question.findMany({
      where,
      take: allQuestions ? undefined : limit ? parseInt(limit) : 10,
      orderBy: { createdAt: 'desc' },
      include: { answers: true },
    });

    const formatted = questions.map((q) => ({
      id: String(q.id),
      text: q.text,
      options: q.answers.map((a) => ({
        id: String(a.id),
        text: a.text,
        isCorrect: a.isCorrect,
      })),
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error fetching questions for quiz:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}
