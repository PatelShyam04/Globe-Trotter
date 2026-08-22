import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const activity = await prisma.activity.findUnique({
      where: { id: params.id },
      include: { stop: { include: { trip: true } } },
    })

    if (!activity || activity.stop.trip.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const data = await request.json()
    const updated = await prisma.activity.update({
      where: { id: params.id },
      data: {
        name: data.name,
        category: data.category,
        description: data.description,
        cost: data.cost,
        durationHours: data.durationHours,
        scheduledTime: data.scheduledTime,
        dayNumber: data.dayNumber,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update activity' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const activity = await prisma.activity.findUnique({
      where: { id: params.id },
      include: { stop: { include: { trip: true } } },
    })

    if (!activity || activity.stop.trip.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.activity.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete activity' }, { status: 500 })
  }
}
