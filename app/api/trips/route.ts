import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getDestinationPhoto } from '@/lib/photos'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const trips = await prisma.trip.findMany({
      where: { userId: session.user.id },
      include: { stops: { include: { activities: true } } },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(trips)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch trips' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, description, startDate, endDate, coverPhoto, isPublic, totalBudget } =
      await request.json()

    if (!name) {
      return NextResponse.json({ error: 'Trip name is required' }, { status: 400 })
    }

    const resolvedPhoto = coverPhoto || getDestinationPhoto(name)

    const trip = await prisma.trip.create({
      data: {
        userId: session.user.id,
        name,
        description,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        coverPhoto: resolvedPhoto,
        isPublic: isPublic ?? false,
        totalBudget: totalBudget ?? 0,
      },
    })

    return NextResponse.json(trip, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create trip' }, { status: 500 })
  }
}
