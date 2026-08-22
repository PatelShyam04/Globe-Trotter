'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import {
  Search,
  Filter,
  ArrowUpDown,
  Layers,
  Plus,
  Calendar,
  MapPin,
  Clock,
  Eye,
  Trash2,
  Share2,
  BarChart2,
  Sparkles,
  Plane,
} from 'lucide-react'
import { formatCurrency, formatDate, getCountryFlag } from '@/lib/helpers'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

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
  startDate?: Date | string | null
  endDate?: Date | string | null
  coverPhoto?: string | null
  isPublic: boolean
  totalBudget: number
  stops: Stop[]
  createdAt: Date | string
}

interface Props {
  trips: Trip[]
}

export default function TripsClient({ trips: initialTrips }: Props) {
  const router = useRouter()
  const [trips, setTrips] = useState(initialTrips)
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'ongoing' | 'upcoming' | 'completed'>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'name' | 'budget'>('newest')

  const now = new Date()

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput)
    }, 250)
    return () => clearTimeout(timer)
  }, [searchInput])

  const handleDelete = async (id: string, name: string) => {
    const res = await fetch(`/api/trips/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success(`"${name}" deleted successfully`)
      setTrips((prev) => prev.filter((t) => t.id !== id))
      router.refresh()
    } else {
      toast.error('Failed to delete trip')
    }
  }

  // Categorize trips into Ongoing, Up-coming, Completed
  const { ongoing, upcoming, completed } = useMemo(() => {
    let list = [...trips]

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.stops.some((s) => s.cityName.toLowerCase().includes(q) || s.country?.toLowerCase().includes(q))
      )
    }

    if (sortBy === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortBy === 'budget') {
      list.sort((a, b) => b.totalBudget - a.totalBudget)
    } else {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }

    const ong: Trip[] = []
    const upc: Trip[] = []
    const com: Trip[] = []

    list.forEach((t) => {
      if (!t.startDate && !t.endDate) {
        upc.push(t)
        return
      }

      const start = t.startDate ? new Date(t.startDate) : null
      const end = t.endDate ? new Date(t.endDate) : null

      if (start && end && now >= start && now <= end) {
        ong.push(t)
      } else if (start && now < start) {
        upc.push(t)
      } else if (end && now > end) {
        com.push(t)
      } else {
        upc.push(t)
      }
    })

    return { ongoing: ong, upcoming: upc, completed: com }
  }, [trips, searchQuery, sortBy])

  const renderTripOverviewCard = (trip: Trip, statusBadge: { text: string; color: string }) => {
    const totalCost = trip.stops
      .flatMap((s) => s.activities)
      .reduce((sum, a) => sum + a.cost, 0)
    const citiesStr = trip.stops.map((s) => s.cityName).join(' → ') || 'No destinations added yet'

    return (
      <div
        key={trip.id}
        className="card !p-5 border border-border hover:border-primary/50 transition-all shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
      >
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`badge ${statusBadge.color} text-xs font-semibold`}>
              {statusBadge.text}
            </span>
            <h3 className="font-heading font-bold text-lg text-text truncate group-hover:text-primary transition-colors">
              {trip.name}
            </h3>
            {trip.isPublic && (
              <span className="badge bg-primary/10 text-primary border border-primary/20 text-[11px]">
                Public
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-muted">
            <MapPin size={13} className="text-primary flex-shrink-0" />
            <span className="truncate">{citiesStr}</span>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted flex-wrap pt-1">
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {trip.startDate ? formatDate(trip.startDate) : 'TBD'} –{' '}
              {trip.endDate ? formatDate(trip.endDate) : 'TBD'}
            </span>
            <span className="text-secondary font-bold">
              Spent: {formatCurrency(totalCost)}
            </span>
            {trip.totalBudget > 0 && (
              <span className="text-muted">
                Budget: {formatCurrency(trip.totalBudget)}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-border/40">
          <Link
            href={`/trips/${trip.id}/itinerary`}
            className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1 font-semibold"
          >
            <Eye size={13} />
            Itinerary
          </Link>
          <Link
            href={`/trips/${trip.id}/budget`}
            className="btn-secondary text-xs py-2 px-3 text-secondary flex items-center gap-1"
          >
            <BarChart2 size={13} />
            Budget
          </Link>
          <button
            onClick={() => handleDelete(trip.id, trip.name)}
            className="btn-danger text-xs py-2 px-3 flex items-center gap-1"
            title="Delete Trip"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in max-w-5xl mx-auto pb-16">
      {/* Screen Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <h1 className="font-heading font-black text-3xl text-text">User Trip Listing</h1>
          <p className="text-muted text-sm mt-0.5">
            Manage all your ongoing, upcoming, and completed travel plans ({trips.length} total)
          </p>
        </div>
        <Link href="/trips/create" className="btn-primary flex items-center gap-2 text-sm py-2.5 px-5">
          <Plus size={16} /> Plan a Trip
        </Link>
      </div>

      {/* Control Bar (Search, Group by, Filter, Sort by) */}
      <div className="card !p-4 flex flex-col md:flex-row items-center gap-3 border border-border/80 shadow-md">
        <div className="relative flex-1 w-full group">
          <Search
            size={18}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors"
          />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search bar ...... (filter by trip name, destination)"
            className="input-base input-icon-left !py-2.5 text-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Group / Status Filter */}
          <div className="relative flex items-center">
            <Layers size={15} className="absolute left-3 text-muted pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="input-base !py-2.5 !pl-9 !pr-8 text-xs font-medium cursor-pointer"
            >
              <option value="all">Group by: All</option>
              <option value="ongoing">Group by: Ongoing</option>
              <option value="upcoming">Group by: Up-coming</option>
              <option value="completed">Group by: Completed</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="relative flex items-center">
            <ArrowUpDown size={15} className="absolute left-3 text-muted pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="input-base !py-2.5 !pl-9 !pr-8 text-xs font-medium cursor-pointer"
            >
              <option value="newest">Sort by: Newest</option>
              <option value="name">Sort by: Name</option>
              <option value="budget">Sort by: Budget</option>
            </select>
          </div>
        </div>
      </div>

      {/* 1. Ongoing Section (Screen 6 wireframe) */}
      {(statusFilter === 'all' || statusFilter === 'ongoing') && (
        <section className="space-y-3">
          <h2 className="font-heading font-bold text-xl text-text flex items-center gap-2 border-b border-border/60 pb-2">
            <span className="w-3 h-3 rounded-full bg-primary animate-pulse" />
            Ongoing ({ongoing.length})
          </h2>

          {ongoing.length === 0 ? (
            <div className="card !p-4 text-center text-muted text-xs bg-surface/50">
              No trips currently active today.
            </div>
          ) : (
            <div className="space-y-3">
              {ongoing.map((t) =>
                renderTripOverviewCard(t, {
                  text: '● Active Now',
                  color: 'bg-primary/20 text-primary border border-primary/30',
                })
              )}
            </div>
          )}
        </section>
      )}

      {/* 2. Up-coming Section (Screen 6 wireframe) */}
      {(statusFilter === 'all' || statusFilter === 'upcoming') && (
        <section className="space-y-3">
          <h2 className="font-heading font-bold text-xl text-text flex items-center gap-2 border-b border-border/60 pb-2">
            <Plane size={18} className="text-secondary" />
            Up-coming ({upcoming.length})
          </h2>

          {upcoming.length === 0 ? (
            <div className="card !p-4 text-center text-muted text-xs bg-surface/50">
              No upcoming trips scheduled. Click &quot;Plan a Trip&quot; to begin!
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map((t) =>
                renderTripOverviewCard(t, {
                  text: '✈️ Up-coming',
                  color: 'bg-secondary/20 text-secondary border border-secondary/30',
                })
              )}
            </div>
          )}
        </section>
      )}

      {/* 3. Completed Section (Screen 6 wireframe) */}
      {(statusFilter === 'all' || statusFilter === 'completed') && (
        <section className="space-y-3">
          <h2 className="font-heading font-bold text-xl text-text flex items-center gap-2 border-b border-border/60 pb-2">
            <Clock size={18} className="text-blue-400" />
            Completed ({completed.length})
          </h2>

          {completed.length === 0 ? (
            <div className="card !p-4 text-center text-muted text-xs bg-surface/50">
              No past completed trips yet.
            </div>
          ) : (
            <div className="space-y-3">
              {completed.map((t) =>
                renderTripOverviewCard(t, {
                  text: '✓ Completed',
                  color: 'bg-gray-500/20 text-gray-300 border border-gray-500/30',
                })
              )}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
