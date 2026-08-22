import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ShieldAlert, ArrowLeft } from 'lucide-react'
import AdminClient from './AdminClient'

export default async function AdminPage() {
  const session = await auth()

  // Role guard — verify user is an admin
  const user = session?.user?.id
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true, name: true, email: true },
      })
    : null

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="card max-w-md mx-auto p-10 text-center border border-border shadow-2xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-danger/10 border border-danger/30 flex items-center justify-center mx-auto text-danger">
            <ShieldAlert size={34} />
          </div>
          <h1 className="font-heading font-black text-2xl text-text">Access Denied</h1>
          <p className="text-muted text-sm leading-relaxed">
            The Admin Panel is restricted to authorized platform administrators only.
          </p>
          <div className="pt-3">
            <Link href="/dashboard" className="btn-primary inline-flex items-center gap-2 text-sm py-2.5 px-6 font-semibold">
              <ArrowLeft size={16} /> Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Fetch cities for popular cities tab
  const cities = await prisma.city.findMany({ orderBy: { popularity: 'desc' } })

  // Fetch city usage counts from stops
  const stopCounts = await prisma.stop.groupBy({
    by: ['cityName'],
    _count: { _all: true },
  })
  const cityUsageMap: Record<string, number> = {}
  stopCounts.forEach((s: any) => { cityUsageMap[s.cityName] = s._count._all })

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
      currentUserId={session!.user!.id!}
    />
  )
}
