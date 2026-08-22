'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  Search,
  Filter,
  ArrowUpDown,
  Layers,
  MapPin,
  Star,
  DollarSign,
  Clock,
  Plus,
  Compass,
  Sparkles,
  CheckCircle2,
  Globe,
  Tag,
} from 'lucide-react'
import { formatCurrency, getCountryFlag } from '@/lib/helpers'
import toast from 'react-hot-toast'
import { GLOBAL_ACTIVITIES, ActivityItem } from '@/lib/activities'

interface City {
  id: string
  name: string
  country: string
  region: string
  costIndex: number
  popularity: number
  description?: string | null
}

interface UserTrip {
  id: string
  name: string
}

interface Props {
  cities: City[]
  userTrips: UserTrip[]
}

const REGIONS = ['All', 'Europe', 'Asia', 'Americas', 'Africa', 'Oceania', 'Middle East']
const CATEGORIES = ['All', 'Adventure', 'Sightseeing', 'Food & Dining', 'Culture', 'Nature']

export default function ExploreClient({ cities, userTrips }: Props) {
  const searchParams = useSearchParams()

  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('All')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortBy, setSortBy] = useState<'rating' | 'costAsc' | 'costDesc'>('rating')

  // Support query params e.g. /explore?region=Europe or /explore?q=Tokyo
  useEffect(() => {
    const regionParam = searchParams.get('region')
    const qParam = searchParams.get('q')
    if (regionParam && REGIONS.includes(regionParam)) {
      setSelectedRegion(regionParam)
    }
    if (qParam) {
      setSearchQuery(qParam)
    }
  }, [searchParams])

  // Debounced search query (250ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim().toLowerCase())
    }, 250)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Filtered & Sorted Activities
  const filteredActivities = useMemo(() => {
    let list = [...GLOBAL_ACTIVITIES]

    // 1. Region filter
    if (selectedRegion !== 'All') {
      list = list.filter((a) => a.region.toLowerCase() === selectedRegion.toLowerCase())
    }

    // 2. Category filter
    if (selectedCategory !== 'All') {
      list = list.filter((a) => a.category.toLowerCase() === selectedCategory.toLowerCase())
    }

    // 3. Search query
    if (debouncedQuery) {
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(debouncedQuery) ||
          a.cityName.toLowerCase().includes(debouncedQuery) ||
          a.country.toLowerCase().includes(debouncedQuery) ||
          a.description.toLowerCase().includes(debouncedQuery) ||
          a.category.toLowerCase().includes(debouncedQuery)
      )
    }

    // 4. Sort
    if (sortBy === 'costAsc') {
      list.sort((a, b) => a.cost - b.cost)
    } else if (sortBy === 'costDesc') {
      list.sort((a, b) => b.cost - a.cost)
    } else {
      list.sort((a, b) => b.rating - a.rating)
    }

    return list
  }, [debouncedQuery, selectedRegion, selectedCategory, sortBy])

  return (
    <div className="space-y-8 animate-in pb-16">
      {/* 1. Header & Title (Matching Screen 5 wireframe) */}
      <div className="border-b border-border/80 pb-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-2">
          <Compass size={13} />
          Worldwide Travel Discovery
        </div>
        <h1 className="font-heading font-black text-3xl md:text-4xl text-text">
          Activity Search Pages / City Search Page
        </h1>
        <p className="text-muted text-sm mt-1">
          Discover {GLOBAL_ACTIVITIES.length}+ top-rated experiences, adventures, and iconic city attractions worldwide
        </p>
      </div>

      {/* 2. Search & Controls Bar */}
      <div className="card !p-4 flex flex-col md:flex-row items-center gap-3 border border-border shadow-lg">
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
            placeholder="Search activities, cities, adventures (e.g. Paragliding, Tokyo, Rome, Giza, Sushi, Safari)..."
            className="input-base input-icon-left !py-2.5 text-sm"
          />
        </div>

        {/* Region Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex items-center w-full md:w-auto">
            <Globe size={15} className="absolute left-3 text-muted pointer-events-none" />
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="input-base !py-2.5 !pl-9 !pr-8 text-xs font-medium cursor-pointer w-full md:w-auto"
            >
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  Region: {r}
                </option>
              ))}
            </select>
          </div>

          {/* Sort by */}
          <div className="relative flex items-center w-full md:w-auto">
            <ArrowUpDown size={15} className="absolute left-3 text-muted pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="input-base !py-2.5 !pl-9 !pr-8 text-xs font-medium cursor-pointer w-full md:w-auto"
            >
              <option value="rating">Sort by: Top Rated</option>
              <option value="costAsc">Sort by: Lowest Price</option>
              <option value="costDesc">Sort by: Highest Price</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Category Tag Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                isSelected
                  ? 'bg-primary text-bg shadow-md shadow-primary/20 scale-102'
                  : 'bg-surface2 text-muted hover:text-text hover:bg-surface border border-border/80'
              }`}
            >
              {cat}
            </button>
          )
        })}
      </div>

      {/* 4. Results List (Matching Screen 5 wireframe) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <h2 className="font-heading font-bold text-xl text-text flex items-center gap-2">
            <Sparkles size={18} className="text-secondary" />
            Results ({filteredActivities.length})
          </h2>
          {(selectedRegion !== 'All' || selectedCategory !== 'All' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedRegion('All')
                setSelectedCategory('All')
                setSearchQuery('')
              }}
              className="text-xs text-primary hover:underline font-semibold"
            >
              Reset Filters
            </button>
          )}
        </div>

        {filteredActivities.length === 0 ? (
          <div className="card !p-12 text-center space-y-3 border-dashed border-2 border-border">
            <div className="text-4xl">🔍</div>
            <h3 className="font-heading font-bold text-lg text-text">No activities found matching &quot;{searchQuery}&quot;</h3>
            <p className="text-muted text-xs max-w-md mx-auto">
              Try searching for another city, or use our AI Magic Planner to auto-generate a custom itinerary for any destination!
            </p>
            <div className="pt-2">
              <Link href={`/trips/create?destination=${encodeURIComponent(searchQuery)}`} className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5">
                <Sparkles size={14} />
                Auto-Plan Trip to &quot;{searchQuery}&quot; with AI
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredActivities.map((act) => (
              <div
                key={act.id}
                className="card !p-4 border border-border hover:border-primary/50 transition-all duration-300 shadow-md hover:shadow-xl flex flex-col sm:flex-row gap-4 group"
              >
                {/* Image */}
                <div className="w-full sm:w-44 h-36 rounded-2xl overflow-hidden relative flex-shrink-0 bg-surface2">
                  <img
                    src={act.image}
                    alt={act.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80'
                    }}
                  />
                  <span className="absolute top-2 left-2 badge bg-surface/90 text-primary text-[10px] font-bold backdrop-blur-sm">
                    {act.category}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <h3 className="font-heading font-bold text-base text-text group-hover:text-primary transition-colors leading-snug">
                      {act.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-muted mt-1 flex-wrap">
                      <span className="text-primary font-medium flex items-center gap-1">
                        <MapPin size={12} /> {act.cityName}, {act.country}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {act.duration}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5 text-secondary font-bold">
                        <Star size={12} fill="currentColor" /> {act.rating}
                      </span>
                    </div>
                    <p className="text-xs text-muted line-clamp-2 mt-2 leading-relaxed">
                      {act.description}
                    </p>
                  </div>

                  {/* Pricing & CTA */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <span className="text-base font-bold text-secondary">
                      {formatCurrency(act.cost)}
                    </span>
                    <Link
                      href={`/trips/create?destination=${encodeURIComponent(act.cityName)}`}
                      className="btn-primary !py-1.5 !px-3 text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-primary/20"
                    >
                      <Plus size={13} />
                      Plan with This
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
