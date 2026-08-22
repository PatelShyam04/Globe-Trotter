'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  ArrowUpDown,
  Layers,
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  DollarSign,
  Plus,
  Eye,
  Sparkles,
} from 'lucide-react'
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isWithinInterval,
} from 'date-fns'
import { formatCurrency, formatDate, getCountryFlag } from '@/lib/helpers'

interface Activity {
  id: string
  name: string
  category: string
  cost: number
  scheduledTime?: string | null
  dayNumber: number
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
  totalBudget: number
  stops: Stop[]
}

interface Props {
  trips: Trip[]
}

const TRIP_COLORS = [
  'bg-primary/20 border-primary/50 text-primary',
  'bg-secondary/20 border-secondary/50 text-secondary',
  'bg-blue-500/20 border-blue-500/50 text-blue-300',
  'bg-purple-500/20 border-purple-500/50 text-purple-300',
  'bg-emerald-500/20 border-emerald-500/50 text-emerald-300',
]

export default function CalendarClient({ trips }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date())
  const [searchQuery, setSearchQuery] = useState('')

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)

  const calendarDays = useMemo(() => {
    return eachDayOfInterval({ start: startDate, end: endDate })
  }, [startDate, endDate])

  const filteredTrips = useMemo(() => {
    if (!searchQuery.trim()) return trips
    const q = searchQuery.toLowerCase()
    return trips.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.stops.some((s) => s.cityName.toLowerCase().includes(q))
    )
  }, [trips, searchQuery])

  // Find trips active on a specific day
  const getTripsForDay = (day: Date) => {
    return filteredTrips.filter((trip) => {
      if (!trip.startDate || !trip.endDate) return false
      const s = new Date(trip.startDate)
      const e = new Date(trip.endDate)
      return isWithinInterval(day, { start: s, end: e }) || isSameDay(day, s) || isSameDay(day, e)
    })
  }

  // Active trips for selected day modal
  const selectedDayTrips = selectedDay ? getTripsForDay(selectedDay) : []

  return (
    <div className="space-y-8 animate-in max-w-5xl mx-auto pb-16">
      {/* Screen Title */}
      <div className="border-b border-border/80 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-3xl text-text flex items-center gap-2.5">
            <CalendarIcon size={28} className="text-primary" />
            Calendar View Screen
          </h1>
          <p className="text-muted text-sm mt-0.5">
            Visualize your multi-city journeys across a full calendar schedule
          </p>
        </div>
        <Link href="/trips/create" className="btn-primary flex items-center gap-2 text-sm py-2.5 px-5">
          <Plus size={16} /> Plan a Trip
        </Link>
      </div>

      {/* Control Bar (Screen 11 wireframe) */}
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
            placeholder="Search bar ...... (filter by trip name or place)"
            className="input-base input-icon-left !py-2.5 text-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setCurrentDate(new Date())}
            className="btn-secondary text-xs py-2 px-3.5 font-semibold whitespace-nowrap"
          >
            Today
          </button>
        </div>
      </div>

      {/* Main Calendar Card (Screen 11 wireframe) */}
      <div className="card !p-6 border border-border shadow-2xl space-y-6">
        {/* Month Navigation: ← Month Year → */}
        <div className="flex items-center justify-between border-b border-border/70 pb-4">
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="p-2 hover:bg-surface2 rounded-xl transition-colors text-muted hover:text-text cursor-pointer"
            aria-label="Previous Month"
          >
            <ChevronLeft size={22} />
          </button>

          <h2 className="font-heading font-black text-2xl md:text-3xl text-text tracking-tight">
            {format(currentDate, 'MMMM yyyy')}
          </h2>

          <button
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="p-2 hover:bg-surface2 rounded-xl transition-colors text-muted hover:text-text cursor-pointer"
            aria-label="Next Month"
          >
            <ChevronRight size={22} />
          </button>
        </div>

        {/* Days of Week Header (SUN MON TUE WED THU FRI SAT) */}
        <div className="grid grid-cols-7 gap-1 text-center font-heading font-bold text-xs uppercase tracking-wider text-muted pb-2 border-b border-border/50">
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Matrix */}
        <div className="grid grid-cols-7 gap-1 md:gap-2">
          {calendarDays.map((day, idx) => {
            const isCurrentMonth = isSameMonth(day, monthStart)
            const isToday = isSameDay(day, new Date())
            const isSelected = selectedDay && isSameDay(day, selectedDay)
            const dayTrips = getTripsForDay(day)

            return (
              <div
                key={idx}
                onClick={() => setSelectedDay(day)}
                className={`min-h-[90px] md:min-h-[110px] p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  !isCurrentMonth
                    ? 'bg-surface/30 opacity-40 border-transparent'
                    : isSelected
                    ? 'bg-surface2 border-primary shadow-md ring-2 ring-primary/20'
                    : isToday
                    ? 'bg-primary/5 border-primary/40'
                    : 'bg-surface2/60 border-border/60 hover:border-primary/40 hover:bg-surface2'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                      isToday
                        ? 'bg-primary text-bg'
                        : isSelected
                        ? 'text-primary font-black'
                        : 'text-muted'
                    }`}
                  >
                    {format(day, 'd')}
                  </span>
                  {dayTrips.length > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  )}
                </div>

                {/* Spanning Trip Badges in Cell */}
                <div className="space-y-1 mt-1 overflow-hidden">
                  {dayTrips.slice(0, 2).map((t, tIdx) => {
                    const colorClass = TRIP_COLORS[tIdx % TRIP_COLORS.length]
                    return (
                      <div
                        key={t.id}
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded border truncate ${colorClass}`}
                        title={t.name}
                      >
                        {t.name.toUpperCase()}
                      </div>
                    )
                  })}
                  {dayTrips.length > 2 && (
                    <span className="text-[9px] text-muted block pl-1">
                      +{dayTrips.length - 2} more
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Selected Day Details Panel */}
      {selectedDay && (
        <div className="card space-y-4 border border-border">
          <div className="flex items-center justify-between border-b border-border/70 pb-3">
            <h3 className="font-heading font-bold text-xl text-text flex items-center gap-2">
              <CalendarIcon size={18} className="text-primary" />
              Schedule for {format(selectedDay, 'EEEE, MMMM d, yyyy')}
            </h3>
            <span className="badge bg-primary/10 text-primary text-xs font-semibold">
              {selectedDayTrips.length} active trip{selectedDayTrips.length !== 1 ? 's' : ''}
            </span>
          </div>

          {selectedDayTrips.length === 0 ? (
            <p className="text-muted text-sm py-4">No trips scheduled on this day.</p>
          ) : (
            <div className="space-y-3">
              {selectedDayTrips.map((t) => (
                <div
                  key={t.id}
                  className="p-4 bg-surface2/70 rounded-xl border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div>
                    <h4 className="font-heading font-bold text-base text-text">{t.name}</h4>
                    <p className="text-muted text-xs mt-0.5">
                      {t.stops.map((s) => s.cityName).join(' → ') || 'Custom Stops'}
                    </p>
                  </div>
                  <Link
                    href={`/trips/${t.id}/itinerary`}
                    className="btn-primary text-xs py-1.5 px-3.5 flex items-center gap-1 font-semibold whitespace-nowrap"
                  >
                    <Eye size={13} /> View Itinerary
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
