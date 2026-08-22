'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Search,
  Filter,
  ArrowUpDown,
  Layers,
  Plus,
  Calendar,
  MapPin,
  DollarSign,
  Compass,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import { formatCurrency, formatDate, getCountryFlag } from '@/lib/helpers'
import TripCard from '@/components/TripCard'

interface City {
  id: string
  name: string
  country: string
  region: string
  costIndex: number
  popularity: number
}

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

interface Props {
  userName: string
  trips: Trip[]
  cities: City[]
  totalBudget: number
}

const REGIONS = [
  { name: 'Europe', emoji: '🏰', subtitle: 'History & Culture' },
  { name: 'Asia', emoji: '🏯', subtitle: 'Temples & Food' },
  { name: 'Americas', emoji: '🗽', subtitle: 'Metros & Nature' },
  { name: 'Africa', emoji: '🦁', subtitle: 'Wildlife & Safari' },
  { name: 'Oceania', emoji: '🌊', subtitle: 'Beaches & Reefs' },
  { name: 'Middle East', emoji: '🕌', subtitle: 'Desert & Modern' },
]

export default function DashboardClient({ userName, trips, cities, totalBudget }: Props) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'newest' | 'name' | 'budget'>('newest')
  const [groupBy, setGroupBy] = useState<'all' | 'upcoming' | 'past'>('all')

  const filteredTrips = useMemo(() => {
    let list = [...trips]

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.stops.some((s) => s.cityName.toLowerCase().includes(q) || s.country?.toLowerCase().includes(q))
      )
    }

    if (groupBy === 'upcoming') {
      list = list.filter((t) => !t.endDate || new Date(t.endDate) >= new Date())
    } else if (groupBy === 'past') {
      list = list.filter((t) => t.endDate && new Date(t.endDate) < new Date())
    }

    if (sortBy === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortBy === 'budget') {
      list.sort((a, b) => b.totalBudget - a.totalBudget)
    } else {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }

    return list
  }, [trips, searchQuery, groupBy, sortBy])

  const filteredCities = useMemo(() => {
    if (!selectedRegion) return cities
    return cities.filter((c) => c.region.toLowerCase() === selectedRegion.toLowerCase())
  }, [cities, selectedRegion])

  return (
    <div className="space-y-10 animate-in relative pb-20">
      {/* 1. Large Hero Banner Image (Matching Screen 3) */}
      <div className="relative rounded-3xl overflow-hidden border border-border/80 shadow-2xl h-72 md:h-80 flex items-end">
        {/* Background Image & Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1600&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-transparent" />
        <div className="absolute inset-0 bg-primary/10 mix-blend-overlay" />

        {/* Banner Content */}
        <div className="relative z-10 p-6 md:p-10 w-full flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 text-primary text-xs font-semibold mb-3">
              <Sparkles size={13} />
              Personalized Travel Dashboard
            </div>
            <h1 className="font-heading font-black text-3xl md:text-5xl text-text tracking-tight">
              Hello, <span className="gradient-text">{userName.split(' ')[0]}</span> ✈️
            </h1>
            <p className="text-muted text-sm md:text-base mt-2 max-w-xl">
              Dream, design, and organize your next global journey with real-time budget intelligence.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/trips/create"
              className="btn-primary flex items-center gap-2 py-3 px-5 text-sm font-semibold shadow-lg shadow-primary/25 whitespace-nowrap"
            >
              <Plus size={16} />
              Plan a New Trip
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Control Bar (Search, Group by, Filter, Sort by) */}
      <div className="card !p-4 flex flex-col md:flex-row items-center gap-3 border border-border/80 shadow-md">
        {/* Search Bar */}
        <div className="relative flex-1 w-full group">
          <Search
            size={18}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search bar ...... (cities, trips, countries)"
            className="input-base input-icon-left !py-2.5 text-sm"
          />
        </div>

        {/* Group by */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex items-center">
            <Layers size={15} className="absolute left-3 text-muted pointer-events-none" />
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as any)}
              className="input-base !py-2.5 !pl-9 !pr-8 text-xs font-medium cursor-pointer"
            >
              <option value="all">Group by: All Trips</option>
              <option value="upcoming">Group by: Upcoming</option>
              <option value="past">Group by: Past / Completed</option>
            </select>
          </div>

          {/* Sort by */}
          <div className="relative flex items-center">
            <ArrowUpDown size={15} className="absolute left-3 text-muted pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="input-base !py-2.5 !pl-9 !pr-8 text-xs font-medium cursor-pointer"
            >
              <option value="newest">Sort by: Newest</option>
              <option value="name">Sort by: Trip Name</option>
              <option value="budget">Sort by: Budget</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Top Regional Selections */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <h2 className="font-heading font-bold text-2xl text-text flex items-center gap-2">
            <Compass size={22} className="text-primary" />
            Top Regional Selections
          </h2>
          {selectedRegion && (
            <button
              onClick={() => setSelectedRegion(null)}
              className="text-xs text-primary hover:underline font-medium"
            >
              Show all regions
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {REGIONS.map((r) => {
            const isSelected = selectedRegion === r.name
            return (
              <button
                key={r.name}
                type="button"
                onClick={() => setSelectedRegion(isSelected ? null : r.name)}
                className={`card !p-4 flex flex-col items-center justify-center text-center transition-all cursor-pointer group hover:-translate-y-1 ${
                  isSelected
                    ? 'border-primary bg-primary/10 shadow-lg shadow-primary/15 scale-102 ring-2 ring-primary/30'
                    : 'hover:border-primary/50'
                }`}
              >
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                  {r.emoji}
                </div>
                <p className="font-heading font-semibold text-sm text-text">{r.name}</p>
                <p className="text-muted text-xs mt-0.5">{r.subtitle}</p>
              </button>
            )
          })}
        </div>

        {/* City cards inside selected region */}
        {selectedRegion && (
          <div className="pt-2 animate-in space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted">
                Showing top destinations & experiences in <strong className="text-primary">{selectedRegion}</strong>:
              </p>
              <Link
                href={`/explore?region=${encodeURIComponent(selectedRegion)}`}
                className="text-xs text-primary hover:underline font-bold flex items-center gap-1"
              >
                Explore all {selectedRegion} activities <ArrowRight size={13} />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
              {filteredCities.map((city) => (
                <div
                  key={city.id}
                  className="card !p-3 hover:border-primary/50 transition-all duration-300 shadow-md group flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-heading font-bold text-sm text-text group-hover:text-primary transition-colors">
                        {getCountryFlag(city.country)} {city.name}
                      </p>
                      <p className="text-muted text-[11px]">{city.country}</p>
                    </div>
                    <span className="badge bg-secondary/15 text-secondary text-[10px] font-bold">
                      {'$'.repeat(Math.min(3, Math.max(1, Math.round(city.costIndex))))}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 pt-2 border-t border-border/50">
                    <Link
                      href={`/trips/create?destination=${encodeURIComponent(city.name)}`}
                      className="btn-primary !py-1 !px-2.5 text-[11px] font-bold flex-1 text-center"
                    >
                      ⚡ Auto-Plan
                    </Link>
                    <Link
                      href={`/explore?q=${encodeURIComponent(city.name)}`}
                      className="btn-secondary !py-1 !px-2.5 text-[11px] font-semibold text-center"
                    >
                      Activities
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 4. Previous Trips */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <h2 className="font-heading font-bold text-2xl text-text flex items-center gap-2">
            <Calendar size={22} className="text-secondary" />
            Previous Trips
          </h2>
          <Link href="/trips" className="text-primary text-sm hover:underline font-medium">
            View All ({trips.length}) →
          </Link>
        </div>

        {filteredTrips.length === 0 ? (
          <div className="card text-center py-16 border-dashed border-2">
            <div className="text-5xl mb-3">🗺️</div>
            <h3 className="font-heading font-bold text-xl mb-1">No trips found</h3>
            <p className="text-muted text-sm mb-6">
              {searchQuery ? 'Try adjusting your search query' : 'Create your first personalized multi-city journey!'}
            </p>
            <Link href="/trips/create" className="btn-primary inline-flex items-center gap-2 text-sm">
              <Plus size={16} /> Plan a Trip
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrips.slice(0, 6).map((trip) => (
              <TripCard key={trip.id} trip={trip as any} />
            ))}
          </div>
        )}
      </section>

      {/* 5. Floating Bottom-Right "+ Plan a trip" Button (Exact Wireframe CTA) */}
      <Link
        href="/trips/create"
        id="floating-plan-trip-btn"
        className="fixed bottom-6 right-6 z-40 btn-primary flex items-center gap-2 px-6 py-3.5 rounded-full shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all text-sm font-bold border border-primary-dark"
      >
        <Plus size={20} />
        Plan a trip
      </Link>
    </div>
  )
}
