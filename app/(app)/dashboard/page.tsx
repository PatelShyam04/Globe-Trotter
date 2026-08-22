import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus, MapPin, DollarSign, Calendar, TrendingUp } from 'lucide-react'
import { formatCurrency, formatDate, getCountryFlag } from '@/lib/helpers'

const FEATURED_CITIES = [
  { name: 'Paris', country: 'France', emoji: '🗼', cost: '$120/day' },
  { name: 'Tokyo', country: 'Japan', emoji: '🗾', cost: '$90/day' },
  { name: 'Bali', country: 'Indonesia', emoji: '🌴', cost: '$50/day' },
  { name: 'New York', country: 'USA', emoji: '🗽', cost: '$200/day' },
  { name: 'Rome', country: 'Italy', emoji: '🏛️', cost: '$100/day' },
  { name: 'Bangkok', country: 'Thailand', emoji: '🏯', cost: '$40/day' },
]

export default async function DashboardPage() {
  const session = await auth()
  const userId = session?.user?.id!

  const trips = await prisma.trip.findMany({
    where: { userId },
    include: { stops: { include: { activities: true } } },
    orderBy: { createdAt: 'desc' },
    take: 6,
  })

  const totalTrips = trips.length
  const totalBudget = trips.reduce(
    (sum, t) => sum + t.stops.flatMap((s) => s.activities).reduce((a, act) => a + act.cost, 0),
    0
  )
  const upcomingTrip = trips.find((t) => t.startDate && new Date(t.startDate) > new Date())

  return (
    <div className="max-w-6xl mx-auto animate-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-heading font-bold text-4xl">
            Welcome back, <span className="gradient-text">{session?.user?.name?.split(' ')[0] || 'Traveler'}</span> ✈️
          </h1>
          <p className="text-muted mt-2">Ready to plan your next adventure?</p>
        </div>
        <Link href="/trips/create" className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Plan New Trip
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[
          { icon: MapPin, label: 'Total Trips', value: totalTrips, color: 'text-primary', bg: 'bg-primary/10' },
          { icon: DollarSign, label: 'Total Spent', value: formatCurrency(totalBudget), color: 'text-secondary', bg: 'bg-secondary/10' },
          { icon: TrendingUp, label: 'Cities Explored', value: trips.reduce((s, t) => s + t.stops.length, 0), color: 'text-blue-400', bg: 'bg-blue-400/10' },
        ].map((stat) => (
          <div key={stat.label} className="card flex items-center gap-4">
            <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
              <stat.icon className={stat.color} size={22} />
            </div>
            <div>
              <p className="text-muted text-sm">{stat.label}</p>
              <p className={`font-heading font-bold text-2xl ${stat.color}`}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent trips */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading font-bold text-2xl">Recent Trips</h2>
          <Link href="/trips" className="text-primary text-sm hover:underline">View all →</Link>
        </div>

        {trips.length === 0 ? (
          <div className="card text-center py-16">
            <div className="text-5xl mb-4">🌍</div>
            <h3 className="font-heading font-bold text-xl mb-2">No trips yet</h3>
            <p className="text-muted mb-6">Start planning your first adventure!</p>
            <Link href="/trips/create" className="btn-primary inline-flex items-center gap-2">
              <Plus size={16} />
              Create First Trip
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {trips.slice(0, 3).map((trip) => {
              const totalCost = trip.stops
                .flatMap((s) => s.activities)
                .reduce((sum, a) => sum + a.cost, 0)
              return (
                <Link key={trip.id} href={`/trips/${trip.id}/itinerary`} className="trip-card block group">
                  <div
                    className="h-36 bg-gradient-to-br from-primary/20 to-surface2 flex items-center justify-center relative overflow-hidden"
                    style={trip.coverPhoto ? { backgroundImage: `url(${trip.coverPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                  >
                    {!trip.coverPhoto && <span className="text-4xl">🌍</span>}
                    <div className="absolute inset-0 bg-gradient-to-t from-surface/80 to-transparent" />
                    {trip.isPublic && (
                      <span className="absolute top-3 right-3 badge bg-primary/20 text-primary">Public</span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-heading font-semibold text-lg truncate">{trip.name}</h3>
                    <div className="flex items-center gap-1 text-muted text-sm mt-1">
                      <Calendar size={13} />
                      {trip.startDate ? formatDate(trip.startDate) : 'No date set'}
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-muted">{trip.stops.length} cities</span>
                      <span className="text-secondary font-semibold text-sm">{formatCurrency(totalCost)}</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* Featured destinations */}
      <div>
        <h2 className="font-heading font-bold text-2xl mb-5">✨ Explore Destinations</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {FEATURED_CITIES.map((city) => (
            <Link
              key={city.name}
              href="/trips/create"
              className="card text-center hover:border-primary/40 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 cursor-pointer"
            >
              <div className="text-3xl mb-2">{city.emoji}</div>
              <p className="font-semibold text-sm">{city.name}</p>
              <p className="text-muted text-xs">{city.country}</p>
              <p className="text-primary text-xs mt-1 font-medium">{city.cost}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
