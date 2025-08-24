import prisma from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const subjectId = searchParams.get('subjectId');
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
    const pageSize = Math.min(
      Math.max(parseInt(searchParams.get('pageSize') || '10', 10), 1),
      100
    );
    const search = searchParams.get('search')?.trim();

    const where: {
      subjectId?: number;
      OR?: Array<{
        name?: { contains: string; mode: 'insensitive' };
        description?: { contains: string; mode: 'insensitive' };
        subject?: { name: { contains: string; mode: 'insensitive' } };
      }>;
    } = {};
    if (subjectId) {
      const subjectIdNumber = parseInt(subjectId);
      if (!isNaN(subjectIdNumber)) where.subjectId = subjectIdNumber;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        // subject relation filter
        { subject: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [total, data] = await prisma.$transaction([
      prisma.module.count({ where }),
      prisma.module.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: { subject: true },
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
    const message = (error as Error)?.message?.toString() || '';
    const lower = message.toLowerCase();
    const uninitialized =
      lower.includes('no such table') ||
      lower.includes('does not exist') ||
      lower.includes('database_url') ||
      lower.includes('environment variable not found');

    if (uninitialized) {
      console.warn(
        '[modules.GET] Database not initialized yet. Returning empty dataset. Full error:',
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

    console.error('[modules.GET] Unexpected error fetching modules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch modules' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, subjectId } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    if (!subjectId) {
      return NextResponse.json(
        { error: 'Subject ID is required' },
        { status: 400 }
      );
    }

    const subjectIdNumber = parseInt(subjectId);
    if (isNaN(subjectIdNumber)) {
      return NextResponse.json(
        { error: 'Invalid subject ID' },
        { status: 400 }
      );
    }

    // Check if subject exists
    const subject = await prisma.subject.findUnique({
      where: { id: subjectIdNumber },
    });

    if (!subject) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    }

    const moduleData = await prisma.module.create({
      data: {
        name,
        description,
        subjectId: subjectIdNumber,
      },
    });

    return NextResponse.json(moduleData, { status: 201 });
  } catch (error) {
    console.error('Error creating module:', error);
    return NextResponse.json(
      { error: 'Failed to create module' },
      { status: 500 }
    );
  }
}
