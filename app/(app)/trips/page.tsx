import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import TripsClient from './TripsClient'

export default async function TripsPage() {
  const session = await auth()
  const userId = session?.user?.id!

  const trips = await prisma.trip.findMany({
    where: { userId },
    include: { stops: { include: { activities: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return <TripsClient trips={trips as any} />
}
