import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, MapPin, DollarSign } from 'lucide-react'
import { formatCurrency, formatDate, getCountryFlag, CATEGORY_CONFIG } from '@/lib/helpers'
import { addDays, format, eachDayOfInterval } from 'date-fns'

export default async function TimelinePage({ params }: { params: { id: string } }) {
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

  const hasDateRange = trip.startDate && trip.endDate
  const days = hasDateRange
    ? eachDayOfInterval({ start: new Date(trip.startDate!), end: new Date(trip.endDate!) })
    : []

  return (
    <div className="max-w-3xl mx-auto animate-in">
      <div className="mb-8">
        <Link href={`/trips/${params.id}/itinerary`} className="flex items-center gap-2 text-muted hover:text-text text-sm mb-4 transition-colors">
          <ArrowLeft size={15} /> Back to Builder
        </Link>
        <h1 className="font-heading font-bold text-3xl">📅 Trip Timeline</h1>
        <p className="text-muted mt-1">{trip.name}</p>
      </div>

      {!hasDateRange ? (
        <div className="card text-center py-16">
          <Calendar size={48} className="text-muted mx-auto mb-4" />
          <h3 className="font-heading font-bold text-xl mb-2">No dates set</h3>
          <p className="text-muted mb-4">Set trip start and end dates to see the calendar timeline.</p>
          <Link href={`/trips/${params.id}/itinerary`} className="btn-primary inline-flex">Edit Trip</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {days.map((day, dayIdx) => {
            const dayNum = dayIdx + 1
            const dayStr = format(day, 'EEE, MMM d')
            const allActivities = trip.stops.flatMap((s) =>
              s.activities.filter((a) => a.dayNumber === dayNum).map((a) => ({ ...a, city: s.cityName, country: s.country }))
            )
            const dayCost = allActivities.reduce((sum, a) => sum + a.cost, 0)

            return (
              <details key={dayIdx} open className="card group">
                <summary className="flex items-center gap-4 cursor-pointer list-none">
                  <div className="w-14 h-14 bg-primary/10 border border-primary/30 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold text-lg leading-none">D{dayNum}</span>
                    <span className="text-muted text-xs">{format(day, 'MMM d')}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{dayStr}</p>
                    <p className="text-muted text-sm">{allActivities.length} activities</p>
                  </div>
                  {dayCost > 0 && (
                    <span className="text-secondary font-bold">{formatCurrency(dayCost)}</span>
                  )}
                </summary>

                <div className="mt-4 pl-18 space-y-2" style={{ paddingLeft: '74px' }}>
                  {allActivities.length === 0 ? (
                    <p className="text-muted text-sm">No activities on this day.</p>
                  ) : (
                    allActivities.map((act) => {
                      const cat = CATEGORY_CONFIG[act.category] || CATEGORY_CONFIG.other
                      return (
                        <div key={act.id} className="flex items-center gap-3 p-3 bg-surface2 rounded-xl">
                          <span>{cat.emoji}</span>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{act.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className={`badge ${cat.color} text-xs`}>{cat.label}</span>
                              <span className="text-muted text-xs flex items-center gap-1">
                                <MapPin size={10} /> {act.city}
                              </span>
                              {act.scheduledTime && (
                                <span className="text-muted text-xs">{act.scheduledTime}</span>
                              )}
                            </div>
                          </div>
                          <span className="text-secondary text-sm font-semibold">{formatCurrency(act.cost)}</span>
                        </div>
                      )
                    })
                  )}
                </div>
              </details>
            )
          })}
        </div>
      )}
    </div>
  )
}
