import prisma from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get the subject ID from the search params
    const searchParams = request.nextUrl.searchParams;
    const subjectId = searchParams.get('subjectId');
    if (!subjectId) {
      return NextResponse.json(
        { error: 'Subject ID is required as a query parameter' },
        { status: 400 }
      );
    }
    const subjectIdNum = parseInt(subjectId, 10);
    if (isNaN(subjectIdNum)) {
      return NextResponse.json(
        { error: 'Subject ID must be a number' },
        { status: 400 }
      );
    }

    // Fetch modules (returns empty array if none without throwing)
    const modules = await prisma.module.findMany({
      where: { subjectId: subjectIdNum },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(modules);
  } catch (error) {
    console.error('Error fetching modules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch modules' },
      { status: 500 }
    );
  }
}
