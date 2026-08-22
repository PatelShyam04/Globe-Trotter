import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const trip = await prisma.trip.findUnique({
      where: { id: params.id },
      include: { stops: { include: { activities: true } } },
    })

    if (!trip || trip.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const allActivities = trip.stops.flatMap((s) => s.activities)
    const totalCost = allActivities.reduce((sum, a) => sum + a.cost, 0)

    const byCat = allActivities.reduce<Record<string, number>>((acc, a) => {
      acc[a.category] = (acc[a.category] || 0) + a.cost
      return acc
    }, {})

    const byStop = trip.stops.map((s) => ({
      city: s.cityName,
      cost: s.activities.reduce((sum, a) => sum + a.cost, 0),
    }))

    const daysCount =
      trip.startDate && trip.endDate
        ? Math.max(
            1,
            Math.ceil(
              (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) /
                (1000 * 60 * 60 * 24)
            ) + 1
          )
        : 1

    return NextResponse.json({
      totalCost,
      byCat,
      byStop,
      avgPerDay: totalCost / daysCount,
      overBudget: trip.totalBudget > 0 && totalCost > trip.totalBudget,
      budget: trip.totalBudget,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get budget' }, { status: 500 })
  }
}
