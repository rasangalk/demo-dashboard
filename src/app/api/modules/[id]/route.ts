import prisma from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid module ID' }, { status: 400 });
    }

    const qModule = await prisma.module.findUnique({
      where: { id },
      include: {
        subject: true,
        subModules: true,
      },
    });

    if (!qModule) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    return NextResponse.json(qModule);
  } catch (error) {
    console.error('Error fetching module:', error);
    return NextResponse.json(
      { error: 'Failed to fetch module' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid module ID' }, { status: 400 });
    }

    const body = await request.json();
    const { name, description, subjectId } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    if (subjectId) {
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
        return NextResponse.json(
          { error: 'Subject not found' },
          { status: 404 }
        );
      }
    }

    const qModule = await prisma.module.update({
      where: { id },
      data: {
        name,
        description,
        ...(subjectId && { subjectId: parseInt(subjectId) }),
      },
    });

    return NextResponse.json(qModule);
  } catch (error) {
    console.error('Error updating module:', error);
    return NextResponse.json(
      { error: 'Failed to update module' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid module ID' }, { status: 400 });
    }

    await prisma.module.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Module deleted successfully' });
  } catch (error) {
    console.error('Error deleting module:', error);
    return NextResponse.json(
      { error: 'Failed to delete module' },
      { status: 500 }
    );
  }
}
