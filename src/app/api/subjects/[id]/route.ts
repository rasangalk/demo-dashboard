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
        { error: 'Invalid subject ID' },
        { status: 400 }
      );
    }

    const subject = await prisma.subject.findUnique({
      where: { id: parseInt(id) },
      include: {
        modules: true,
      },
    });

    if (!subject) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    }

    return NextResponse.json(subject);
  } catch (error) {
    console.error('Error fetching subject:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subject' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Invalid subject ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const subject = await prisma.subject.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
      },
    });

    return NextResponse.json(subject);
  } catch (error) {
    console.error('Error updating subject:', error);
    return NextResponse.json(
      { error: 'Failed to update subject' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Invalid subject ID' },
        { status: 400 }
      );
    }

    await prisma.subject.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    console.error('Error deleting subject:', error);
    return NextResponse.json(
      { error: 'Failed to delete subject' },
      { status: 500 }
    );
  }
}
