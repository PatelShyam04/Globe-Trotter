import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const stop = await prisma.stop.findUnique({
      where: { id: params.id },
      include: { trip: true },
    })

    if (!stop || stop.trip.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { name, category, description, cost, durationHours, scheduledTime, dayNumber } =
      await request.json()

    const activity = await prisma.activity.create({
      data: {
        stopId: params.id,
        name,
        category: category || 'other',
        description,
        cost: cost || 0,
        durationHours: durationHours || null,
        scheduledTime: scheduledTime || null,
        dayNumber: dayNumber || 1,
      },
    })

    return NextResponse.json(activity, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add activity' }, { status: 500 })
  }
}
