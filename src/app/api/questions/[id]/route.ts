import prisma from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Invalid question ID' },
        { status: 400 }
      );
    }

    const question = await prisma.question.findUnique({
      where: { id: parseInt(id) },
      include: {
        subModule: {
          include: {
            module: {
              include: {
                subject: true,
              },
            },
          },
        },
        answers: true,
      },
    });

    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(question);
  } catch (error) {
    console.error('Error fetching question:', error);
    return NextResponse.json(
      { error: 'Failed to fetch question' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Invalid question ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { text, subModuleId, answers } = body;

    if (!text) {
      return NextResponse.json(
        { error: 'Question text is required' },
        { status: 400 }
      );
    }

    if (subModuleId) {
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
    }

    if (answers) {
      if (!Array.isArray(answers) || answers.length < 2) {
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
    }

    // Update question and answers in a transaction
    await prisma.$transaction(async (prisma) => {
      // Update question
      await prisma.question.update({
        where: { id: parseInt(id) },
        data: {
          text,
          ...(subModuleId && { subModuleId: parseInt(subModuleId) }),
        },
      });

      // Update answers if provided
      if (answers && Array.isArray(answers)) {
        // Delete existing answers
        await prisma.answer.deleteMany({
          where: {
            questionId: parseInt(id),
          },
        });

        // Create new answers
        for (const answer of answers) {
          await prisma.answer.create({
            data: {
              text: answer.text,
              isCorrect: answer.isCorrect || false,
              questionId: parseInt(id),
            },
          });
        }
      }
    });

    // Fetch the updated question with answers
    const updatedQuestion = await prisma.question.findUnique({
      where: { id: parseInt(id) },
      include: {
        answers: true,
      },
    });

    return NextResponse.json(updatedQuestion);
  } catch (error) {
    console.error('Error updating question:', error);
    return NextResponse.json(
      { error: 'Failed to update question' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Invalid question ID' },
        { status: 400 }
      );
    }

    await prisma.question.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error);
    return NextResponse.json(
      { error: 'Failed to delete question' },
      { status: 500 }
    );
  }
}
