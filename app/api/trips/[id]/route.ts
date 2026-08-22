import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const trip = await prisma.trip.findUnique({
      where: { id: params.id },
      include: {
        stops: {
          include: { activities: { orderBy: [{ dayNumber: 'asc' }, { scheduledTime: 'asc' }] } },
          orderBy: { orderIndex: 'asc' },
        },
      },
    })

    if (!trip) return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
    if (trip.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(trip)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch trip' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const data = await request.json()
    const trip = await prisma.trip.findUnique({ where: { id: params.id } })
    if (!trip || trip.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found or forbidden' }, { status: 403 })
    }

    const updated = await prisma.trip.update({
      where: { id: params.id },
      data: {
        name: data.name,
        description: data.description,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        coverPhoto: data.coverPhoto,
        isPublic: data.isPublic,
        totalBudget: data.totalBudget,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update trip' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const trip = await prisma.trip.findUnique({ where: { id: params.id } })
    if (!trip || trip.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found or forbidden' }, { status: 403 })
    }

    await prisma.trip.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete trip' }, { status: 500 })
  }
}
