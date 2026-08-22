import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminClient from './AdminClient'

export default async function AdminPage() {
  const session = await auth()

  // Fetch registered users
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      city: true,
      country: true,
      image: true,
      createdAt: true,
      _count: { select: { trips: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Fetch popular cities
  const cities = await prisma.city.findMany({
    orderBy: { popularity: 'desc' },
    take: 15,
  })

  // Fetch activities and stops stats
  const activities = await prisma.activity.findMany({
    select: {
      id: true,
      name: true,
      category: true,
      cost: true,
    },
    take: 50,
  })

  const trips = await prisma.trip.findMany({
    select: {
      id: true,
      name: true,
      totalBudget: true,
      createdAt: true,
    },
  })

  return (
    <AdminClient
      users={users as any}
      cities={cities}
      activities={activities}
      trips={trips as any}
    />
  )
}
