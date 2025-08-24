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
      return NextResponse.json(
        { error: 'Invalid submodule ID' },
        { status: 400 }
      );
    }

    const subModule = await prisma.subModule.findUnique({
      where: { id },
      include: {
        module: {
          include: {
            subject: true,
          },
        },
        questions: {
          include: {
            answers: true,
          },
        },
      },
    });

    if (!subModule) {
      return NextResponse.json(
        { error: 'Submodule not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(subModule);
  } catch (error) {
    console.error('Error fetching submodule:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submodule' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid submodule ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, description, moduleId } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    if (moduleId) {
      const moduleIdNumber = parseInt(moduleId);
      if (isNaN(moduleIdNumber)) {
        return NextResponse.json(
          { error: 'Invalid module ID' },
          { status: 400 }
        );
      }

      // Check if module exists
      const moduleData = await prisma.module.findUnique({
        where: { id: moduleIdNumber },
      });

      if (!moduleData) {
        return NextResponse.json(
          { error: 'Module not found' },
          { status: 404 }
        );
      }
    }

    const subModule = await prisma.subModule.update({
      where: { id },
      data: {
        name,
        description,
        ...(moduleId && { moduleId: parseInt(moduleId) }),
      },
    });

    return NextResponse.json(subModule);
  } catch (error) {
    console.error('Error updating submodule:', error);
    return NextResponse.json(
      { error: 'Failed to update submodule' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid submodule ID' },
        { status: 400 }
      );
    }

    await prisma.subModule.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Submodule deleted successfully' });
  } catch (error) {
    console.error('Error deleting submodule:', error);
    return NextResponse.json(
      { error: 'Failed to delete submodule' },
      { status: 500 }
    );
  }
}
