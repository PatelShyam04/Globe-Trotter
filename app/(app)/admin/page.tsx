import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import AdminClient from './AdminClient'

export default async function AdminPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  // Role guard — only admins can access this page
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, name: true, email: true },
  })

  if (user?.role !== 'admin') {
    redirect('/dashboard?error=access_denied')
  }

  // Fetch cities for popular cities tab
  const cities = await prisma.city.findMany({ orderBy: { popularity: 'desc' } })

  // Fetch city usage counts from stops
  const stopCounts = await prisma.stop.groupBy({
    by: ['cityName'],
    _count: { _all: true },
  })
  const cityUsageMap: Record<string, number> = {}
  stopCounts.forEach(s => { cityUsageMap[s.cityName] = s._count._all })

  // Fetch activities for popular activities tab
  const activities = await prisma.activity.findMany({
    select: {
      id: true,
      name: true,
      category: true,
      cost: true,
      stop: { select: { cityName: true, country: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  return (
    <AdminClient
      cities={cities}
      cityUsageMap={cityUsageMap}
      activities={activities as any}
      currentUserId={session.user.id}
    />
  )
}
