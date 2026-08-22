'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
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
} from 'lucide-react'
import { formatCurrency, getCountryFlag } from '@/lib/helpers'
import toast from 'react-hot-toast'

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

interface ActivityItem {
  id: string
  name: string
  cityName: string
  country: string
  category: string
  cost: number
  duration: string
  rating: number
  description: string
  image: string
}

const SAMPLE_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act-1',
    name: 'Tandem Paragliding over the Swiss Alps',
    cityName: 'Zurich',
    country: 'Switzerland',
    category: 'Adventure',
    cost: 190,
    duration: '3 hours',
    rating: 4.9,
    description: 'Breathtaking tandem flight with panoramic views of snow-capped peaks and azure lakes.',
    image: 'https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'act-2',
    name: 'Traditional Tsukiji Sushi Masterclass',
    cityName: 'Tokyo',
    country: 'Japan',
    category: 'Food & Dining',
    cost: 85,
    duration: '2.5 hours',
    rating: 4.8,
    description: 'Learn authentic nigiri craftsmanship from master chefs in Tokyo’s historic culinary district.',
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'act-3',
    name: 'Skip-the-Line Colosseum & Roman Forum Tour',
    cityName: 'Rome',
    country: 'Italy',
    category: 'Sightseeing',
    cost: 65,
    duration: '3 hours',
    rating: 4.9,
    description: 'Explore the gladiators arena and ancient ruins with an expert historian guide.',
    image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'act-4',
    name: 'Ubud Sacred Monkey Forest & Waterfall Trek',
    cityName: 'Bali',
    country: 'Indonesia',
    category: 'Adventure',
    cost: 45,
    duration: '5 hours',
    rating: 4.7,
    description: 'Trek through lush jungle canopies, sacred temples, and hidden tropical waterfalls.',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'act-5',
    name: 'Sunset Catamaran Cruise on the Seine River',
    cityName: 'Paris',
    country: 'France',
    category: 'Sightseeing',
    cost: 95,
    duration: '2 hours',
    rating: 4.8,
    description: 'Champagne sunset tour passing Notre-Dame, the Louvre, and illuminated Eiffel Tower.',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'act-6',
    name: 'Desert Dune Bashing & Bedouin Camp BBQ',
    cityName: 'Dubai',
    country: 'UAE',
    category: 'Adventure',
    cost: 110,
    duration: '6 hours',
    rating: 4.9,
    description: '4x4 dune bashing across golden sands followed by camel riding and stargazing.',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'act-7',
    name: 'Gaudí Architecture & Sagrada Família Tour',
    cityName: 'Barcelona',
    country: 'Spain',
    category: 'Sightseeing',
    cost: 55,
    duration: '2.5 hours',
    rating: 4.8,
    description: 'Immerse in Catalan Modernism through Park Güell and the awe-inspiring basilica.',
    image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=600&q=80',
  },
]

interface Props {
  cities: City[]
  userTrips: UserTrip[]
}

export default function ExploreClient({ cities, userTrips }: Props) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortBy, setSortBy] = useState<'popularity' | 'cost_asc' | 'cost_desc'>('popularity')
  const [groupBy, setGroupBy] = useState<'all' | 'adventure' | 'sightseeing' | 'food'>('all')

  const filteredItems = useMemo(() => {
    let list = [...SAMPLE_ACTIVITIES]

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.cityName.toLowerCase().includes(q) ||
          a.country.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q)
      )
    }

    if (selectedCategory !== 'All') {
      list = list.filter((a) => a.category.toLowerCase().includes(selectedCategory.toLowerCase()))
    }

    if (groupBy !== 'all') {
      list = list.filter((a) => a.category.toLowerCase().includes(groupBy.toLowerCase()))
    }

    if (sortBy === 'cost_asc') {
      list.sort((a, b) => a.cost - b.cost)
    } else if (sortBy === 'cost_desc') {
      list.sort((a, b) => b.cost - a.cost)
    } else {
      list.sort((a, b) => b.rating - a.rating)
    }

    return list
  }, [searchQuery, selectedCategory, groupBy, sortBy])

  return (
    <div className="space-y-8 animate-in max-w-5xl mx-auto pb-16">
      {/* Screen Title */}
      <div className="border-b border-border/80 pb-4">
        <h1 className="font-heading font-black text-3xl text-text flex items-center gap-2">
          <Compass size={28} className="text-primary" />
          Activity Search Pages / City Search Page
        </h1>
        <p className="text-muted text-sm mt-0.5">
          Discover top-rated experiences, adventures, and city attractions worldwide
        </p>
      </div>

      {/* Control Bar (Matching Screen 8 Wireframe) */}
      <div className="card !p-4 flex flex-col md:flex-row items-center gap-3 border border-border shadow-md">
        {/* Search input with preset example "Paragliding" */}
        <div className="relative flex-1 w-full group">
          <Search
            size={18}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Paragliding, Sushi masterclass, Museums, Paris..."
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
              <option value="all">Group by: All</option>
              <option value="adventure">Group by: Adventure</option>
              <option value="sightseeing">Group by: Sightseeing</option>
              <option value="food">Group by: Food & Dining</option>
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
              <option value="popularity">Sort by: Top Rated</option>
              <option value="cost_asc">Sort by: Price: Low to High</option>
              <option value="cost_desc">Sort by: Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Header (Screen 8 wireframe) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border/70 pb-3">
          <h2 className="font-heading font-bold text-2xl text-text flex items-center gap-2">
            <Sparkles size={20} className="text-secondary" />
            Results ({filteredItems.length})
          </h2>
          <div className="flex gap-1.5 flex-wrap">
            {['All', 'Adventure', 'Sightseeing', 'Food & Dining'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  selectedCategory === cat
                    ? 'bg-primary text-bg'
                    : 'bg-surface2 text-muted hover:text-text'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results List: Option and its details (Screen 8 wireframe) */}
        {filteredItems.length === 0 ? (
          <div className="card !p-12 text-center text-muted text-sm border-dashed border-2">
            No activities or places found matching &quot;{searchQuery}&quot;. Try clearing filters.
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="card !p-4 border border-border hover:border-primary/50 transition-all shadow-md flex flex-col sm:flex-row items-start sm:items-center gap-4 group"
              >
                {/* Thumbnail */}
                <div className="w-full sm:w-36 h-28 rounded-xl overflow-hidden bg-surface2 flex-shrink-0 relative">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2 left-2 badge bg-surface/90 text-primary text-[10px] font-bold">
                    {item.category}
                  </span>
                </div>

                {/* Option and its details */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-heading font-bold text-base text-text truncate group-hover:text-primary transition-colors">
                      {item.name}
                    </h3>
                    <span className="font-heading font-black text-secondary text-base whitespace-nowrap">
                      {formatCurrency(item.cost)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-muted">
                    <span className="flex items-center gap-1 text-primary">
                      <MapPin size={12} /> {item.cityName}, {item.country}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> {item.duration}
                    </span>
                    <span className="flex items-center gap-1 text-secondary font-semibold">
                      <Star size={12} className="fill-secondary" /> {item.rating}
                    </span>
                  </div>

                  <p className="text-muted text-xs line-clamp-2 leading-relaxed pt-0.5">
                    {item.description}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex sm:flex-col items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
                  <Link
                    href={`/trips/create?destination=${encodeURIComponent(item.cityName)}`}
                    className="btn-primary text-xs py-2 px-4 font-semibold whitespace-nowrap w-full sm:w-auto text-center"
                  >
                    + Plan with This
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
