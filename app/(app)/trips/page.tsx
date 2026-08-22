import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import TripCard from '@/components/TripCard'
import { Plus } from 'lucide-react'

export default async function TripsPage() {
  const session = await auth()
  const trips = await prisma.trip.findMany({
    where: { userId: session?.user?.id! },
    include: { stops: { include: { activities: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="max-w-6xl mx-auto animate-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading font-bold text-3xl">My Trips</h1>
          <p className="text-muted mt-1">{trips.length} trip{trips.length !== 1 ? 's' : ''} planned</p>
        </div>
        <Link href="/trips/create" id="create-trip-btn" className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          New Trip
        </Link>
      </div>

      {trips.length === 0 ? (
        <div className="card text-center py-24">
          <div className="text-6xl mb-5">🗺️</div>
          <h2 className="font-heading font-bold text-2xl mb-3">No trips yet</h2>
          <p className="text-muted mb-8 max-w-sm mx-auto">
            Start planning your next adventure. Add cities, activities, and track your budget.
          </p>
          <Link href="/trips/create" className="btn-primary inline-flex items-center gap-2">
            <Plus size={16} />
            Plan Your First Trip
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip as any} />
          ))}
        </div>
      )}
    </div>
  )
}
