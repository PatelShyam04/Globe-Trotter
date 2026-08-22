'use client'

import { useEffect, useState } from 'react'
import { Globe, Share2, Link2, MapPin, Calendar, DollarSign, Clock, Loader2, Lock } from 'lucide-react'
import { formatCurrency, formatDate, getCountryFlag, CATEGORY_CONFIG } from '@/lib/helpers'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Activity {
  id: string; name: string; category: string; cost: number
  scheduledTime?: string | null; dayNumber: number; durationHours?: number | null
}
interface Stop { id: string; cityName: string; country?: string | null; activities: Activity[] }
interface Trip {
  id: string; name: string; description?: string | null; startDate?: string | null
  endDate?: string | null; coverPhoto?: string | null; stops: Stop[]
  user: { name?: string | null; image?: string | null }
}

export default function PublicItineraryPage({ params }: { params: { id: string } }) {
  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetch(`/api/public/${params.id}`)
      .then((r) => {
        if (!r.ok) { setNotFound(true); setLoading(false); return null }
        return r.json()
      })
      .then((d) => { if (d) { setTrip(d); setLoading(false) } })
  }, [params.id])

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Link copied!')
  }

  if (loading) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <Loader2 size={40} className="text-primary animate-spin" />
    </div>
  )

  if (notFound || !trip) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="text-center card max-w-md mx-auto p-12">
        <Lock size={48} className="text-muted mx-auto mb-4" />
        <h1 className="font-heading font-bold text-2xl mb-3">Trip Not Found</h1>
        <p className="text-muted mb-6">This trip is either private or doesn't exist.</p>
        <Link href="/" className="btn-primary">Back to Home</Link>
      </div>
    </div>
  )

  const totalCost = trip.stops.flatMap((s) => s.activities).reduce((sum, a) => sum + a.cost, 0)

  return (
    <div className="min-h-screen bg-bg">
      {/* Nav */}
      <nav className="border-b border-border px-8 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Globe size={22} className="text-primary" />
          <span className="font-heading font-bold">GlobeTrotter</span>
        </Link>
        <div className="flex gap-3">
          <button onClick={copyLink} className="btn-secondary flex items-center gap-2 text-sm py-2">
            <Link2 size={15} /> Copy Link
          </button>
          <button
            onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent('Check out my trip: ' + trip.name + ' on GlobeTrotter')}&url=${encodeURIComponent(window.location.href)}`, '_blank')}
            className="btn-secondary flex items-center gap-2 text-sm py-2"
          >
            𝕏 Tweet
          </button>
          <Link href="/signup" className="btn-primary text-sm py-2">
            Plan My Trip
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div
        className="h-64 bg-gradient-to-br from-primary/20 to-surface flex items-end relative overflow-hidden"
        style={trip.coverPhoto ? { backgroundImage: `url(${trip.coverPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/50 to-transparent" />
        <div className="relative z-10 px-8 pb-8 max-w-4xl mx-auto w-full">
          <div className="flex items-center gap-2 mb-2">
            <span className="badge bg-primary/20 text-primary border border-primary/30 flex items-center gap-1">
              <Share2 size={12} /> Public Itinerary
            </span>
          </div>
          <h1 className="font-heading font-black text-4xl">{trip.name}</h1>
          {trip.user?.name && (
            <p className="text-muted mt-1">By {trip.user.name}</p>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-8">
        {/* Meta */}
        <div className="flex items-center gap-6 mb-8 p-4 card">
          {trip.startDate && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar size={16} className="text-primary" />
              <span>{formatDate(trip.startDate)} – {trip.endDate ? formatDate(trip.endDate) : 'TBD'}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm">
            <MapPin size={16} className="text-primary" />
            <span>{trip.stops.length} cities</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <DollarSign size={16} className="text-secondary" />
            <span className="text-secondary font-bold">{formatCurrency(totalCost)}</span>
          </div>
        </div>

        {/* Itinerary */}
        <div className="space-y-6">
          {trip.stops.map((stop) => (
            <div key={stop.id} className="card">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{getCountryFlag(stop.country || '')}</span>
                <div>
                  <h2 className="font-heading font-bold text-xl">{stop.cityName}</h2>
                  <p className="text-muted text-sm">{stop.country}</p>
                </div>
                <div className="ml-auto text-secondary font-bold">
                  {formatCurrency(stop.activities.reduce((s, a) => s + a.cost, 0))}
                </div>
              </div>

              {stop.activities.length === 0 ? (
                <p className="text-muted text-sm">No activities</p>
              ) : (
                <div className="space-y-2">
                  {stop.activities.map((act) => {
                    const cat = CATEGORY_CONFIG[act.category] || CATEGORY_CONFIG.other
                    return (
                      <div key={act.id} className="flex items-center gap-3 p-3 bg-surface2 rounded-xl">
                        <span>{cat.emoji}</span>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{act.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`badge ${cat.color} text-xs`}>{cat.label}</span>
                            {act.scheduledTime && (
                              <span className="text-muted text-xs flex items-center gap-1">
                                <Clock size={10} /> {act.scheduledTime}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-secondary font-semibold text-sm">{formatCurrency(act.cost)}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 card text-center py-10">
          <Globe size={40} className="text-primary mx-auto mb-3" />
          <h3 className="font-heading font-bold text-2xl mb-2">Inspired? Plan your own trip!</h3>
          <p className="text-muted mb-6">Join GlobeTrotter and create stunning itineraries for free.</p>
          <Link href="/signup" className="btn-primary inline-flex items-center gap-2 text-lg py-4 px-8">
            Start Planning Free →
          </Link>
        </div>
      </div>
    </div>
  )
}
