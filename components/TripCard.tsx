'use client'

import { useRouter } from 'next/navigation'
import { formatCurrency, formatDate, getCountryFlag } from '@/lib/helpers'
import { Calendar, MapPin, Trash2, Eye, Edit2, Share2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Activity {
  id: string
  cost: number
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
  startDate?: Date | null
  endDate?: Date | null
  coverPhoto?: string | null
  isPublic: boolean
  totalBudget: number
  stops: Stop[]
  createdAt: Date
}

export default function TripCard({ trip }: { trip: Trip }) {
  const router = useRouter()
  const totalCost = trip.stops.flatMap((s) => s.activities).reduce((sum, a) => sum + a.cost, 0)
  const cities = trip.stops.map((s) => getCountryFlag(s.country || '') + ' ' + s.cityName).join(' → ')

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!confirm('Delete this trip? This cannot be undone.')) return
    const res = await fetch(`/api/trips/${trip.id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Trip deleted')
      router.refresh()
    } else {
      toast.error('Failed to delete trip')
    }
  }

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!trip.isPublic) {
      toast.error('Enable public sharing in trip settings first')
      return
    }
    const url = `${window.location.origin}/itinerary/${trip.id}`
    navigator.clipboard.writeText(url)
    toast.success('Link copied to clipboard!')
  }

  return (
    <div className="trip-card">
      {/* Cover */}
      <div
        className="h-40 bg-gradient-to-br from-primary/20 to-surface2 relative overflow-hidden"
        style={
          trip.coverPhoto
            ? { backgroundImage: `url(${trip.coverPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : {}
        }
      >
        {!trip.coverPhoto && (
          <div className="absolute inset-0 flex items-center justify-center text-5xl">🌍</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
        {trip.isPublic && (
          <span className="absolute top-3 right-3 badge bg-primary/20 text-primary border border-primary/30">
            Public
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-heading font-bold text-lg truncate mb-1">{trip.name}</h3>
        {cities && <p className="text-muted text-xs truncate mb-2">{cities || 'No cities added'}</p>}

        <div className="flex items-center gap-1 text-muted text-xs mb-3">
          <Calendar size={12} />
          {trip.startDate ? formatDate(trip.startDate) : 'No date'} –{' '}
          {trip.endDate ? formatDate(trip.endDate) : 'TBD'}
        </div>

        <div className="flex items-center justify-between mb-4">
          <span className="flex items-center gap-1 text-xs text-muted">
            <MapPin size={12} /> {trip.stops.length} {trip.stops.length === 1 ? 'city' : 'cities'}
          </span>
          <span className="text-secondary font-bold">{formatCurrency(totalCost)}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            href={`/trips/${trip.id}/itinerary`}
            id={`view-trip-${trip.id}`}
            className="btn-secondary flex-1 flex items-center justify-center gap-1 py-2 text-xs"
          >
            <Eye size={13} />
            View
          </Link>
          <Link
            href={`/trips/${trip.id}/budget`}
            className="btn-secondary flex items-center justify-center gap-1 py-2 px-3 text-xs"
          >
            <Edit2 size={13} />
          </Link>
          <button
            onClick={handleShare}
            className="btn-secondary flex items-center justify-center gap-1 py-2 px-3 text-xs"
          >
            <Share2 size={13} />
          </button>
          <button
            id={`delete-trip-${trip.id}`}
            onClick={handleDelete}
            className="btn-danger flex items-center justify-center py-2 px-3 text-xs"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}
