import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus, Search, Filter, ArrowUpDown, Layers, MapPin, Calendar, DollarSign, Sparkles } from 'lucide-react'
import { formatCurrency, formatDate, getCountryFlag } from '@/lib/helpers'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const session = await auth()
  const userId = session?.user?.id!

  const trips = await prisma.trip.findMany({
    where: { userId },
    include: { stops: { include: { activities: true } } },
    orderBy: { createdAt: 'desc' },
  })

  const cities = await prisma.city.findMany({
    orderBy: { popularity: 'desc' },
    take: 12,
  })

  const totalBudget = trips.reduce(
    (sum, t) => sum + t.stops.flatMap((s) => s.activities).reduce((a, act) => a + act.cost, 0),
    0
  )

  return (
    <DashboardClient
      userName={session?.user?.name || 'Explorer'}
      trips={trips as any}
      cities={cities}
      totalBudget={totalBudget}
    />
  )
}
