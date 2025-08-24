import prisma from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
    const pageSize = Math.min(
      Math.max(parseInt(searchParams.get('pageSize') || '10', 10), 1),
      100
    );
    const search = searchParams.get('search')?.trim();
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
            {
              description: {
                contains: search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
          ],
        }
      : {};

    const [total, data] = await prisma.$transaction([
      prisma.subject.count({ where }),
      prisma.subject.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);

    return NextResponse.json({
      data,
      page,
      pageSize,
      total,
      totalPages,
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
        '[subjects.GET] Database not initialized yet. Returning empty dataset. Full error:',
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

    console.error('[subjects.GET] Unexpected error fetching subjects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subjects' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const subject = await prisma.subject.create({
      data: {
        name,
        description,
      },
    });

    return NextResponse.json(subject, { status: 201 });
  } catch (error) {
    console.error('Error creating subject:', error);
    return NextResponse.json(
      { error: 'Failed to create subject' },
      { status: 500 }
    );
  }
}
