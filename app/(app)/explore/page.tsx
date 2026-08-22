import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ExploreClient from './ExploreClient'

export default async function ExplorePage() {
  const session = await auth()
  const userId = session?.user?.id!

  const cities = await prisma.city.findMany({
    orderBy: { popularity: 'desc' },
  })

  const trips = await prisma.trip.findMany({
    where: { userId },
    select: { id: true, name: true },
    orderBy: { createdAt: 'desc' },
  })

  return <ExploreClient cities={cities} userTrips={trips} />
}
