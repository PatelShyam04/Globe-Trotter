import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const adminUser = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } })
  if (adminUser?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const trips = await prisma.trip.findMany({
    where: { userId: params.id },
    include: {
      stops: {
        include: { activities: { select: { cost: true } } },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ trips })
}
