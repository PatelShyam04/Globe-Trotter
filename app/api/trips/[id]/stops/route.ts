import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const trip = await prisma.trip.findUnique({ where: { id: params.id } })
    if (!trip || trip.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { cityName, country, arrivalDate, departureDate, costIndex } = await request.json()

    const existingCount = await prisma.stop.count({ where: { tripId: params.id } })

    const stop = await prisma.stop.create({
      data: {
        tripId: params.id,
        cityName,
        country: country || '',
        arrivalDate: arrivalDate ? new Date(arrivalDate) : null,
        departureDate: departureDate ? new Date(departureDate) : null,
        orderIndex: existingCount,
        costIndex: costIndex || 1.0,
      },
    })

    return NextResponse.json(stop, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add stop' }, { status: 500 })
  }
}
