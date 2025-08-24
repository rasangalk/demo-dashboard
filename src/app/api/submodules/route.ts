import prisma from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const moduleId = searchParams.get('moduleId');
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
    const pageSize = Math.min(
      Math.max(parseInt(searchParams.get('pageSize') || '10', 10), 1),
      100
    );
    const search = searchParams.get('search')?.trim();

    const where: {
      moduleId?: number;
      OR?: Array<{
        name?: { contains: string; mode: 'insensitive' };
        description?: { contains: string; mode: 'insensitive' };
        module?: {
          name?: { contains: string; mode: 'insensitive' };
          subject?: { name: { contains: string; mode: 'insensitive' } };
        };
      }>;
    } = {};
    if (moduleId) {
      const moduleIdNumber = parseInt(moduleId);
      if (!isNaN(moduleIdNumber)) where.moduleId = moduleIdNumber;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { module: { name: { contains: search, mode: 'insensitive' } } },
        {
          module: {
            subject: { name: { contains: search, mode: 'insensitive' } },
          },
        },
      ];
    }

    const [total, data] = await prisma.$transaction([
      prisma.subModule.count({ where }),
      prisma.subModule.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: { module: { include: { subject: true } } },
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
    // Common first-run issues we can gracefully handle:
    // 1. DATABASE_URL missing / client init error
    // 2. Tables not migrated yet (e.g. "no such table" / "does not exist")
    const message = (error as Error)?.message?.toString() || '';
    const lower = message.toLowerCase();
    const uninitialized =
      lower.includes('no such table') ||
      lower.includes('does not exist') ||
      lower.includes('database_url') ||
      lower.includes('environment variable not found');

    if (uninitialized) {
      console.warn(
        '[submodules.GET] Database not initialized yet. Returning empty dataset. Full error:',
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
      '[submodules.GET] Unexpected error fetching submodules:',
      error
    );
    return NextResponse.json(
      { error: 'Failed to fetch submodules' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, moduleId } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    if (!moduleId) {
      return NextResponse.json(
        { error: 'Module ID is required' },
        { status: 400 }
      );
    }

    const moduleIdNumber = parseInt(moduleId);
    if (isNaN(moduleIdNumber)) {
      return NextResponse.json({ error: 'Invalid module ID' }, { status: 400 });
    }

    // Check if module exists
    const moduleData = await prisma.module.findUnique({
      where: { id: moduleIdNumber },
    });

    if (!moduleData) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    const subModule = await prisma.subModule.create({
      data: {
        name,
        description,
        moduleId: moduleIdNumber,
      },
    });

    return NextResponse.json(subModule, { status: 201 });
  } catch (error) {
    console.error('Error creating submodule:', error);
    return NextResponse.json(
      { error: 'Failed to create submodule' },
      { status: 500 }
    );
  }
}
