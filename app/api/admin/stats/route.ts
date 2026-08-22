import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const adminUser = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } })
  if (adminUser?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const [
    totalUsers,
    totalTrips,
    totalActivities,
    publicTrips,
    adminUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.trip.count(),
    prisma.activity.count(),
    prisma.trip.count({ where: { isPublic: true } }),
    prisma.user.count({ where: { role: 'admin' } }),
  ])

  // Avg budget across all trips
  const budgetAgg = await prisma.trip.aggregate({ _avg: { totalBudget: true } })
  const avgBudget = Math.round(budgetAgg._avg.totalBudget || 0)

  // Monthly trip creation (last 6 months)
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
  sixMonthsAgo.setDate(1)
  sixMonthsAgo.setHours(0, 0, 0, 0)

  const recentTrips = await prisma.trip.findMany({
    where: { createdAt: { gte: sixMonthsAgo } },
    select: { createdAt: true },
  })

  const recentUsers = await prisma.user.findMany({
    where: { createdAt: { gte: sixMonthsAgo } },
    select: { createdAt: true },
  })

  // Group by month
  const monthLabels: string[] = []
  const tripsByMonth: number[] = []
  const usersByMonth: number[] = []

  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const label = d.toLocaleDateString('en-US', { month: 'short' })
    monthLabels.push(label)
    const y = d.getFullYear()
    const m = d.getMonth()
    tripsByMonth.push(recentTrips.filter(t => {
      const td = new Date(t.createdAt)
      return td.getFullYear() === y && td.getMonth() === m
    }).length)
    usersByMonth.push(recentUsers.filter(u => {
      const ud = new Date(u.createdAt)
      return ud.getFullYear() === y && ud.getMonth() === m
    }).length)
  }

  // Category spending
  const activities = await prisma.activity.findMany({ select: { category: true, cost: true } })
  const categories = ['sightseeing', 'food', 'adventure', 'transport', 'stay', 'other']
  const categoryLabels = ['Sightseeing', 'Food & Dining', 'Adventure', 'Transport', 'Stay', 'Other']
  const categoryTotals = categories.map(cat =>
    Math.round(activities.filter(a => a.category === cat).reduce((s, a) => s + a.cost, 0))
  )

  // Popular cities (city name + how many stops use it)
  const stops = await prisma.stop.findMany({ select: { cityName: true, country: true } })
  const cityCountMap: Record<string, number> = {}
  stops.forEach(s => {
    const key = `${s.cityName}||${s.country}`
    cityCountMap[key] = (cityCountMap[key] || 0) + 1
  })
  const popularDestinations = Object.entries(cityCountMap)
    .map(([key, count]) => {
      const [cityName, country] = key.split('||')
      return { cityName, country, count }
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)

  return NextResponse.json({
    kpis: { totalUsers, totalTrips, totalActivities, publicTrips, adminUsers, avgBudget },
    monthly: { labels: monthLabels, trips: tripsByMonth, users: usersByMonth },
    categories: { labels: categoryLabels, totals: categoryTotals },
    popularDestinations,
  })
}
