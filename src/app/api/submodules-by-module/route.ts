import prisma from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get the module ID from the search params
    const searchParams = request.nextUrl.searchParams;
    const moduleId = searchParams.get('moduleId');
    if (!moduleId) {
      return NextResponse.json(
        { error: 'Module ID is required as a query parameter' },
        { status: 400 }
      );
    }
    const moduleIdNum = parseInt(moduleId, 10);
    if (isNaN(moduleIdNum)) {
      return NextResponse.json(
        { error: 'Module ID must be a number' },
        { status: 400 }
      );
    }

    // Fetch submodules for the given module
    const submodules = await prisma.subModule.findMany({
      where: { moduleId: moduleIdNum },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(submodules);
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
        '[submodules-by-module.GET] Database not initialized yet. Returning empty dataset. Full error:',
        message
      );
      return NextResponse.json([]);
    }

    console.error(
      '[submodules-by-module.GET] Unexpected error fetching submodules:',
      error
    );
    return NextResponse.json(
      { error: 'Failed to fetch submodules' },
      { status: 500 }
    );
  }
}
