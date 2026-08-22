import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, DollarSign, MapPin } from 'lucide-react'
import { formatCurrency, formatDate, getCountryFlag, CATEGORY_CONFIG } from '@/lib/helpers'

export default async function ItineraryViewPage({ params }: { params: { id: string } }) {
  const session = await auth()
  const trip = await prisma.trip.findUnique({
    where: { id: params.id },
    include: {
      stops: {
        include: { activities: { orderBy: [{ dayNumber: 'asc' }, { scheduledTime: 'asc' }] } },
        orderBy: { orderIndex: 'asc' },
      },
    },
  })

  if (!trip || trip.userId !== session?.user?.id) notFound()

  const totalCost = trip.stops.flatMap((s) => s.activities).reduce((sum, a) => sum + a.cost, 0)

  return (
    <div className="max-w-3xl mx-auto animate-in">
      <div className="mb-8">
        <Link href={`/trips/${params.id}/itinerary`} className="flex items-center gap-2 text-muted hover:text-text text-sm mb-4 transition-colors">
          <ArrowLeft size={15} /> Back to Builder
        </Link>
        <h1 className="font-heading font-bold text-3xl">{trip.name}</h1>
        {trip.description && <p className="text-muted mt-2">{trip.description}</p>}
        <div className="flex items-center gap-4 mt-3 text-sm text-muted">
          {trip.startDate && <span>📅 {formatDate(trip.startDate)} – {trip.endDate ? formatDate(trip.endDate) : 'TBD'}</span>}
          <span><MapPin size={13} className="inline" /> {trip.stops.length} cities</span>
          <span className="text-secondary font-semibold">{formatCurrency(totalCost)}</span>
        </div>
      </div>

      {trip.stops.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-muted">No stops yet. Go to the builder to add cities.</p>
        </div>
      ) : (
        <div className="relative">
          <div className="timeline-line" />
          <div className="space-y-8 pl-14">
            {trip.stops.map((stop, idx) => (
              <div key={stop.id} className="relative animate-in">
                {/* Timeline dot */}
                <div className="absolute -left-14 top-0 flex flex-col items-center">
                  <div className="w-12 h-12 bg-primary/10 border-2 border-primary rounded-full flex items-center justify-center text-xl">
                    {getCountryFlag(stop.country || '')}
                  </div>
                  {idx < trip.stops.length - 1 && (
                    <div className="w-0.5 bg-gradient-to-b from-primary/40 to-transparent mt-2" style={{ height: '60px' }} />
                  )}
                </div>

                {/* Stop card */}
                <div className="card">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="font-heading font-bold text-2xl">{stop.cityName}</h2>
                      <p className="text-muted">{stop.country}</p>
                    </div>
                    <div className="text-right">
                      {stop.arrivalDate && (
                        <p className="text-sm text-muted">{formatDate(stop.arrivalDate)} → {stop.departureDate ? formatDate(stop.departureDate) : 'TBD'}</p>
                      )}
                      <p className="text-secondary font-bold">
                        {formatCurrency(stop.activities.reduce((s, a) => s + a.cost, 0))}
                      </p>
                    </div>
                  </div>

                  {stop.activities.length === 0 ? (
                    <p className="text-muted text-sm">No activities for this stop.</p>
                  ) : (
                    <div className="space-y-3">
                      {/* Group by day */}
                      {Array.from(new Set(stop.activities.map((a) => a.dayNumber))).sort().map((day) => (
                        <div key={day}>
                          <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 border-b border-border pb-1">
                            Day {day}
                          </div>
                          <div className="space-y-2">
                            {stop.activities.filter((a) => a.dayNumber === day).map((act) => {
                              const cat = CATEGORY_CONFIG[act.category] || CATEGORY_CONFIG.other
                              return (
                                <div key={act.id} className="flex items-center gap-3 p-3 bg-surface2 rounded-xl">
                                  <span className="text-xl">{cat.emoji}</span>
                                  <div className="flex-1">
                                    <p className="font-medium">{act.name}</p>
                                    <div className="flex items-center gap-3 mt-0.5">
                                      <span className={`badge ${cat.color} text-xs`}>{cat.label}</span>
                                      {act.scheduledTime && (
                                        <span className="text-muted text-xs flex items-center gap-1">
                                          <Clock size={11} /> {act.scheduledTime}
                                        </span>
                                      )}
                                      {act.durationHours && (
                                        <span className="text-muted text-xs">{act.durationHours}h</span>
                                      )}
                                    </div>
                                  </div>
                                  <span className="text-secondary font-semibold">{formatCurrency(act.cost)}</span>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
