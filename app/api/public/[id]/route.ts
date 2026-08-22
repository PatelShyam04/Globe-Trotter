import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const trip = await prisma.trip.findUnique({
      where: { id: params.id, isPublic: true },
      include: {
        user: { select: { name: true, image: true } },
        stops: {
          include: { activities: { orderBy: [{ dayNumber: 'asc' }, { scheduledTime: 'asc' }] } },
          orderBy: { orderIndex: 'asc' },
        },
      },
    })

    if (!trip) return NextResponse.json({ error: 'Trip not found or not public' }, { status: 404 })

    return NextResponse.json(trip)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch public trip' }, { status: 500 })
  }
}
