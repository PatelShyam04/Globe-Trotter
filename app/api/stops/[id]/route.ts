import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    const data = await request.json()
    const updated = await prisma.stop.update({
      where: { id: params.id },
      data: {
        cityName: data.cityName,
        country: data.country,
        arrivalDate: data.arrivalDate ? new Date(data.arrivalDate) : null,
        departureDate: data.departureDate ? new Date(data.departureDate) : null,
        orderIndex: data.orderIndex,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update stop' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    await prisma.stop.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete stop' }, { status: 500 })
  }
}
