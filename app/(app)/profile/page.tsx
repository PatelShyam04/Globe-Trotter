import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ProfileClient from './ProfileClient'

export default async function ProfilePage() {
  const session = await auth()
  const userId = session?.user?.id!

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      city: true,
      country: true,
      bio: true,
      image: true,
      createdAt: true,
    },
  })

  const trips = await prisma.trip.findMany({
    where: { userId },
    include: { stops: { include: { activities: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return <ProfileClient user={user as any} trips={trips as any} />
}
