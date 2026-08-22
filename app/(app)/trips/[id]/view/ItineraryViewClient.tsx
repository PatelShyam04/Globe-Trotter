'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Search,
  Filter,
  ArrowUpDown,
  Layers,
  Calendar,
  Clock,
  DollarSign,
  ArrowDown,
  MapPin,
  Sparkles,
  Compass,
} from 'lucide-react'
import { formatCurrency, formatDate, getCountryFlag, CATEGORY_CONFIG } from '@/lib/helpers'

interface Activity {
  id: string
  name: string
  category: string
  cost: number
  scheduledTime?: string | null
  dayNumber: number
  durationHours?: number | null
  description?: string | null
}

interface Stop {
  id: string
  cityName: string
  country?: string | null
  arrivalDate?: string | null
  departureDate?: string | null
  activities: Activity[]
}

interface Trip {
  id: string
  name: string
  description?: string | null
  startDate?: string | null
  endDate?: string | null
  totalBudget: number
  stops: Stop[]
}

interface Props {
  trip: Trip
}

export default function ItineraryViewClient({ trip }: Props) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCity, setSelectedCity] = useState<string>('All')
  const [sortBy, setSortBy] = useState<'day' | 'cost_desc' | 'cost_asc'>('day')

  const totalTripCost = trip.stops
    .flatMap((s) => s.activities)
    .reduce((sum, a) => sum + a.cost, 0)

  // Flatten activities with stop context
  const allActivitiesWithStop = useMemo(() => {
    return trip.stops.flatMap((stop) =>
      stop.activities.map((act) => ({
        ...act,
        cityName: stop.cityName,
        country: stop.country,
      }))
    )
  }, [trip])

  // Filtered activities
  const filteredActivities = useMemo(() => {
    let list = [...allActivitiesWithStop]

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.cityName.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q)
      )
    }

    if (selectedCity !== 'All') {
      list = list.filter((a) => a.cityName === selectedCity)
    }

    if (sortBy === 'cost_desc') {
      list.sort((a, b) => b.cost - a.cost)
    } else if (sortBy === 'cost_asc') {
      list.sort((a, b) => a.cost - b.cost)
    } else {
      list.sort((a, b) => a.dayNumber - b.dayNumber)
    }

    return list
  }, [allActivitiesWithStop, searchQuery, selectedCity, sortBy])

  // Group activities by day
  const daysList = useMemo(() => {
    const daysMap = new Map<number, typeof filteredActivities>()
    filteredActivities.forEach((act) => {
      const existing = daysMap.get(act.dayNumber) || []
      existing.push(act)
      daysMap.set(act.dayNumber, existing)
    })
    return Array.from(daysMap.entries()).sort((a, b) => a[0] - b[0])
  }, [filteredActivities])

  return (
    <div className="max-w-4xl mx-auto animate-in space-y-8 pb-16">
      {/* Top Header Navigation */}
      <div className="border-b border-border/80 pb-4">
        <Link
          href={`/trips/${trip.id}/itinerary`}
          className="flex items-center gap-1.5 text-muted hover:text-text text-xs mb-2 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Itinerary Builder
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="font-heading font-black text-3xl text-text flex items-center gap-2">
              <Compass size={28} className="text-primary" />
              Itinerary View Screen with budget section
            </h1>
            <p className="text-muted text-sm mt-0.5">{trip.name}</p>
          </div>
          <div className="bg-surface2/90 border border-border px-4 py-2 rounded-xl text-right">
            <span className="text-[11px] text-muted block uppercase font-semibold">Total Trip Expense</span>
            <span className="text-lg font-heading font-black text-secondary">{formatCurrency(totalTripCost)}</span>
          </div>
        </div>
      </div>

      {/* Control Bar (Screen 9 wireframe) */}
      <div className="card !p-4 flex flex-col md:flex-row items-center gap-3 border border-border shadow-md">
        <div className="relative flex-1 w-full group">
          <Search
            size={18}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search bar ...... (filter activities, places)"
            className="input-base input-icon-left !py-2.5 text-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Group by City */}
          <div className="relative flex items-center">
            <Layers size={15} className="absolute left-3 text-muted pointer-events-none" />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="input-base !py-2.5 !pl-9 !pr-8 text-xs font-medium cursor-pointer"
            >
              <option value="All">Group by: All Cities</option>
              {trip.stops.map((s) => (
                <option key={s.id} value={s.cityName}>
                  {s.cityName}
                </option>
              ))}
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
              <option value="day">Sort by: Day Flow</option>
              <option value="cost_desc">Sort by: Expense: High to Low</option>
              <option value="cost_asc">Sort by: Expense: Low to High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Title Header (Screen 9 wireframe) */}
      <div className="text-center pt-2">
        <h2 className="font-heading font-black text-2xl md:text-3xl text-text tracking-tight">
          Itinerary for a selected place
        </h2>
        <p className="text-muted text-xs mt-1">Sequential physical activity flow and matching expenses</p>
      </div>

      {/* Column Headers (Screen 9 wireframe) */}
      <div className="grid grid-cols-12 gap-4 px-4 py-2 border-b border-border/80 text-sm font-heading font-bold text-muted uppercase tracking-wider">
        <div className="col-span-8 sm:col-span-9 flex items-center gap-2">
          <Sparkles size={15} className="text-primary" />
          <span>Physical Activity</span>
        </div>
        <div className="col-span-4 sm:col-span-3 text-right flex items-center justify-end gap-1.5">
          <DollarSign size={15} className="text-secondary" />
          <span>Expense</span>
        </div>
      </div>

      {/* Days List with Flow Arrows and Expense cards (Screen 9 wireframe) */}
      {daysList.length === 0 ? (
        <div className="card !p-12 text-center text-muted text-sm border-dashed border-2">
          No activities found. Go to Itinerary Builder to add activities to your trip!
        </div>
      ) : (
        <div className="space-y-10">
          {daysList.map(([dayNum, acts]) => {
            const dayExpense = acts.reduce((sum, a) => sum + a.cost, 0)
            return (
              <div key={dayNum} className="space-y-4">
                {/* Day Badge */}
                <div className="flex items-center justify-between">
                  <span className="badge bg-primary text-bg font-heading font-black text-sm px-4 py-1.5 rounded-xl shadow-md shadow-primary/20">
                    Day {dayNum}
                  </span>
                  <span className="text-xs text-muted font-medium">
                    Day Total: <strong className="text-secondary">{formatCurrency(dayExpense)}</strong>
                  </span>
                </div>

                {/* Activities Flow */}
                <div className="space-y-3">
                  {acts.map((act, actIdx) => {
                    const cat = CATEGORY_CONFIG[act.category] || CATEGORY_CONFIG.other
                    const isLast = actIdx === acts.length - 1

                    return (
                      <div key={act.id} className="space-y-3">
                        {/* Activity Row: Left Physical Activity + Right Expense Box */}
                        <div className="grid grid-cols-12 gap-4 items-center">
                          {/* Left: Physical Activity Box */}
                          <div className="col-span-8 sm:col-span-9 card !p-4 border border-border/90 hover:border-primary/50 transition-all shadow-md bg-surface flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-surface2 flex items-center justify-center text-xl flex-shrink-0">
                              {cat.emoji}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-heading font-semibold text-base text-text truncate">
                                {act.name}
                              </h3>
                              <div className="flex items-center gap-3 text-xs text-muted mt-0.5">
                                <span className={`badge ${cat.color} text-[10px]`}>{cat.label}</span>
                                <span className="flex items-center gap-1">
                                  <MapPin size={11} className="text-primary" /> {act.cityName}
                                </span>
                                {act.scheduledTime && (
                                  <span className="flex items-center gap-1">
                                    <Clock size={11} /> {act.scheduledTime}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Right: Expense Box */}
                          <div className="col-span-4 sm:col-span-3 card !p-4 border border-border/90 bg-surface2/70 text-right flex flex-col items-end justify-center shadow-md">
                            <span className="font-heading font-black text-lg text-secondary">
                              {formatCurrency(act.cost)}
                            </span>
                            <span className="text-[10px] text-muted">Estimated</span>
                          </div>
                        </div>

                        {/* Flow Down Arrow between steps */}
                        {!isLast && (
                          <div className="flex items-center pl-10 text-primary/70 py-0.5">
                            <div className="flex items-center gap-1 text-xs font-semibold text-primary/80">
                              <ArrowDown size={18} className="animate-bounce" />
                              <span className="text-[11px] uppercase tracking-wider">Next Stop</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
