'use client'

import { useEffect, useState } from 'react'
import {
  Compass,
  Share2,
  Link2,
  MapPin,
  Calendar,
  DollarSign,
  Clock,
  Loader2,
  Lock,
  ArrowLeft,
  Sparkles,
} from 'lucide-react'
import { formatCurrency, formatDate, getCountryFlag, CATEGORY_CONFIG } from '@/lib/helpers'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Activity {
  id: string
  name: string
  category: string
  cost: number
  scheduledTime?: string | null
  dayNumber: number
  durationHours?: number | null
}

interface Stop {
  id: string
  cityName: string
  country?: string | null
  activities: Activity[]
}

interface Trip {
  id: string
  name: string
  description?: string | null
  startDate?: string | null
  endDate?: string | null
  coverPhoto?: string | null
  stops: Stop[]
  user: { name?: string | null; image?: string | null }
}

export default function PublicItineraryPage({ params }: { params: { id: string } }) {
  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetch(`/api/public/${params.id}`)
      .then((r) => {
        if (!r.ok) {
          setNotFound(true)
          setLoading(false)
          return null
        }
        return r.json()
      })
      .then((d) => {
        if (d) {
          setTrip(d)
          setLoading(false)
        }
      })
  }, [params.id])

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Link copied!')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <Loader2 size={40} className="text-primary animate-spin" />
      </div>
    )
  }

  if (notFound || !trip) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <div className="text-center card max-w-md mx-auto p-10 border border-border shadow-2xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-surface2 flex items-center justify-center mx-auto text-muted">
            <Lock size={32} />
          </div>
          <h1 className="font-heading font-black text-2xl text-text">Trip Not Found</h1>
          <p className="text-muted text-sm leading-relaxed">
            This trip is either private or doesn&apos;t exist.
          </p>
          <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-2">
            <Link href="/dashboard" className="btn-primary text-sm py-2.5 px-6 font-semibold">
              Back to Dashboard
            </Link>
            <Link href="/community" className="btn-secondary text-sm py-2.5 px-5">
              Explore Community
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const totalCost = trip.stops
    .flatMap((s) => s.activities)
    .reduce((sum, a) => sum + a.cost, 0)

  return (
    <div className="min-h-screen bg-bg pb-16">
      {/* Top Header */}
      <header className="border-b border-border/80 bg-surface/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Compass size={24} className="text-primary" />
          <span className="font-heading font-black text-lg text-text">GlobeTrotter</span>
        </Link>
        <div className="flex items-center gap-2">
          <button onClick={copyLink} className="btn-secondary flex items-center gap-1.5 text-xs py-2 px-3">
            <Link2 size={14} /> Copy Link
          </button>
          <button
            onClick={() =>
              window.open(
                `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  'Check out my trip: ' + trip.name + ' on GlobeTrotter'
                )}&url=${encodeURIComponent(window.location.href)}`,
                '_blank'
              )
            }
            className="btn-secondary flex items-center gap-1.5 text-xs py-2 px-3"
          >
            𝕏 Tweet
          </button>
          <Link href="/trips/create" className="btn-primary text-xs py-2 px-4 font-semibold">
            Plan My Trip
          </Link>
        </div>
      </header>

      {/* Hero Banner */}
      <div
        className="h-72 bg-gradient-to-br from-primary/20 to-surface flex items-end relative overflow-hidden"
        style={
          trip.coverPhoto
            ? {
                backgroundImage: `url(${trip.coverPhoto})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : {}
        }
      >
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-transparent" />
        <div className="relative z-10 px-6 sm:px-8 pb-8 max-w-4xl mx-auto w-full space-y-2">
          <span className="badge bg-primary/20 text-primary border border-primary/30 inline-flex items-center gap-1 text-xs">
            <Share2 size={12} /> Public Itinerary
          </span>
          <h1 className="font-heading font-black text-3xl sm:text-4xl text-text">{trip.name}</h1>
          {trip.user?.name && <p className="text-muted text-sm">Created by {trip.user.name}</p>}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 sm:px-8 pt-8 space-y-8">
        {/* Meta summary */}
        <div className="card !p-4 flex items-center gap-6 flex-wrap border border-border shadow-md">
          {trip.startDate && (
            <div className="flex items-center gap-2 text-xs">
              <Calendar size={15} className="text-primary" />
              <span>
                {formatDate(trip.startDate)} –{' '}
                {trip.endDate ? formatDate(trip.endDate) : 'TBD'}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs">
            <MapPin size={15} className="text-primary" />
            <span>{trip.stops.length} destinations</span>
          </div>
          <div className="flex items-center gap-2 text-xs ml-auto">
            <DollarSign size={15} className="text-secondary" />
            <span className="text-secondary font-bold text-sm">
              {formatCurrency(totalCost)}
            </span>
          </div>
        </div>

        {/* Stops & Activities list */}
        <div className="space-y-6">
          {trip.stops.map((stop, idx) => (
            <div key={stop.id} className="card space-y-4 border border-border">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-sm flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div>
                    <h2 className="font-heading font-bold text-xl text-text flex items-center gap-2">
                      {getCountryFlag(stop.country || '')} {stop.cityName}
                    </h2>
                    <span className="text-muted text-xs">{stop.country}</span>
                  </div>
                </div>
                <div className="text-secondary font-bold text-sm">
                  {formatCurrency(stop.activities.reduce((s, a) => s + a.cost, 0))}
                </div>
              </div>

              {stop.activities.length === 0 ? (
                <p className="text-muted text-xs">No scheduled activities for this stop.</p>
              ) : (
                <div className="space-y-2">
                  {stop.activities.map((act) => {
                    const cat = CATEGORY_CONFIG[act.category] || CATEGORY_CONFIG.other
                    return (
                      <div
                        key={act.id}
                        className="flex items-center gap-3 p-3 bg-surface2/60 rounded-xl"
                      >
                        <span className="text-lg">{cat.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate text-text">{act.name}</p>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-muted">
                            <span className={`badge ${cat.color} text-[10px]`}>{cat.label}</span>
                            {act.scheduledTime && (
                              <span className="flex items-center gap-1">
                                <Clock size={10} /> {act.scheduledTime}
                              </span>
                            )}
                            <span>Day {act.dayNumber}</span>
                          </div>
                        </div>
                        <span className="text-secondary font-bold text-sm">
                          {formatCurrency(act.cost)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="card text-center py-10 border border-border shadow-xl space-y-3">
          <Sparkles size={36} className="text-primary mx-auto" />
          <h3 className="font-heading font-bold text-2xl text-text">Inspired? Plan your own trip!</h3>
          <p className="text-muted text-sm max-w-md mx-auto">
            Join GlobeTrotter to customize this itinerary or start creating your own adventure.
          </p>
          <div className="pt-2">
            <Link href="/trips/create" className="btn-primary inline-flex items-center gap-2 py-3 px-8 text-sm font-semibold">
              Plan My Trip Now →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
