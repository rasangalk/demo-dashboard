import prisma from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const subModuleId = searchParams.get('subModuleId');
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
    const pageSize = Math.min(
      Math.max(parseInt(searchParams.get('pageSize') || '10', 10), 1),
      100
    );
    const search = searchParams.get('search')?.trim();

    const where: any = {};
    if (subModuleId) {
      const subModuleIdNumber = parseInt(subModuleId);
      if (!isNaN(subModuleIdNumber)) where.subModuleId = subModuleIdNumber;
    }
    if (search) {
      where.OR = [
        { text: { contains: search, mode: 'insensitive' } },
        { subModule: { name: { contains: search, mode: 'insensitive' } } },
        {
          subModule: {
            module: { name: { contains: search, mode: 'insensitive' } },
          },
        },
        {
          subModule: {
            module: {
              subject: { name: { contains: search, mode: 'insensitive' } },
            },
          },
        },
      ];
    }

    const [total, data] = await prisma.$transaction([
      prisma.question.count({ where }),
      prisma.question.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          subModule: { include: { module: { include: { subject: true } } } },
          answers: true,
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return NextResponse.json({
      data,
      page,
      pageSize,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / pageSize),
    });
  } catch (error) {
    const message = (error as any)?.message?.toString() || '';
    const lower = message.toLowerCase();
    const uninitialized =
      lower.includes('no such table') ||
      lower.includes('does not exist') ||
      lower.includes('database_url') ||
      lower.includes('environment variable not found');

    if (uninitialized) {
      console.warn(
        '[questions.GET] Database not initialized yet. Returning empty dataset. Full error:',
        message
      );
      return NextResponse.json({
        data: [],
        page: 1,
        pageSize: 10,
        total: 0,
        totalPages: 0,
        warning: 'Database not initialized yet – run migrations / seed.',
      });
    }

    console.error(
      '[questions.GET] Unexpected error fetching questions:',
      error
    );
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, subModuleId, answers } = body;

    if (!text) {
      return NextResponse.json(
        { error: 'Question text is required' },
        { status: 400 }
      );
    }

    if (!subModuleId) {
      return NextResponse.json(
        { error: 'SubModule ID is required' },
        { status: 400 }
      );
    }

    if (!answers || !Array.isArray(answers) || answers.length < 2) {
      return NextResponse.json(
        { error: 'At least two answers are required' },
        { status: 400 }
      );
    }

    // Ensure at least one answer is marked as correct
    const hasCorrectAnswer = answers.some((answer) => answer.isCorrect);
    if (!hasCorrectAnswer) {
      return NextResponse.json(
        { error: 'At least one answer must be marked as correct' },
        { status: 400 }
      );
    }

    const subModuleIdNumber = parseInt(subModuleId);
    if (isNaN(subModuleIdNumber)) {
      return NextResponse.json(
        { error: 'Invalid submodule ID' },
        { status: 400 }
      );
    }

    // Check if submodule exists
    const subModule = await prisma.subModule.findUnique({
      where: { id: subModuleIdNumber },
    });

    if (!subModule) {
      return NextResponse.json(
        { error: 'SubModule not found' },
        { status: 404 }
      );
    }

    // Create question with answers in a transaction
    const question = await prisma.$transaction(async (prisma) => {
      const newQuestion = await prisma.question.create({
        data: {
          text,
          subModuleId: subModuleIdNumber,
        },
      });

      // Create answers
      for (const answer of answers) {
        await prisma.answer.create({
          data: {
            text: answer.text,
            isCorrect: answer.isCorrect || false,
            questionId: newQuestion.id,
          },
        });
      }

      return newQuestion;
    });

    // Fetch the created question with answers
    const createdQuestion = await prisma.question.findUnique({
      where: { id: question.id },
      include: {
        answers: true,
      },
    });

    return NextResponse.json(createdQuestion, { status: 201 });
  } catch (error) {
    console.error('Error creating question:', error);
    return NextResponse.json(
      { error: 'Failed to create question' },
      { status: 500 }
    );
  }
}
