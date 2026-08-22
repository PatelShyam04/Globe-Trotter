import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import CommunityClient from './CommunityClient'

export default async function CommunityPage() {
  const session = await auth()
  const userId = session?.user?.id!

  // Fetch all public trips shared across the community
  const publicTrips = await prisma.trip.findMany({
    where: { isPublic: true },
    include: {
      user: { select: { id: true, name: true, image: true, city: true, country: true } },
      stops: {
        include: {
          activities: true,
        },
        orderBy: { orderIndex: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  // Also user's own trips for one-click publishing
  const userTrips = await prisma.trip.findMany({
    where: { userId },
    select: { id: true, name: true, isPublic: true },
  })

  return (
    <CommunityClient
      initialTrips={publicTrips as any}
      userTrips={userTrips}
      currentUserId={userId}
    />
  )
}
