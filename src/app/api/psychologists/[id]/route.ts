import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const psychologist = await prisma.psychologist.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
        hospital: {
          select: {
            name: true,
            location: true,
            address: true,
          },
        },
        reviews: {
          where: { status: "APPROVED" },
          include: {
            patient: {
              include: {
                user: {
                  select: { name: true, image: true },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!psychologist) {
      return NextResponse.json(
        { error: 'Psychologist not found' },
        { status: 404 }
      );
    }

    if (psychologist.status !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Psychologist not available' },
        { status: 403 }
      );
    }

    return NextResponse.json(psychologist);
  } catch (error) {
    console.error('Error fetching psychologist:', error);
    return NextResponse.json(
      { error: 'Failed to fetch psychologist' },
      { status: 500 }
    );
  }
}
