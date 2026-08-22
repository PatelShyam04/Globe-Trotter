'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Search,
  Filter,
  ArrowUpDown,
  Layers,
  Heart,
  Share2,
  MapPin,
  Calendar,
  DollarSign,
  Compass,
  Sparkles,
  MessageCircle,
  Eye,
  Plus,
  Send,
} from 'lucide-react'
import { formatCurrency, formatDate, getCountryFlag } from '@/lib/helpers'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface Activity {
  id: string
  name: string
  category: string
  cost: number
}

interface Stop {
  id: string
  cityName: string
  country?: string | null
  activities: Activity[]
}

interface PublicTrip {
  id: string
  name: string
  description?: string | null
  startDate?: string | null
  endDate?: string | null
  coverPhoto?: string | null
  totalBudget: number
  stops: Stop[]
  createdAt: string
  user: {
    id: string
    name?: string | null
    image?: string | null
    city?: string | null
    country?: string | null
  }
}

interface UserTrip {
  id: string
  name: string
  isPublic: boolean
}

interface Props {
  initialTrips: PublicTrip[]
  userTrips: UserTrip[]
  currentUserId: string
}

// Sample rich community posts if few public trips exist yet
const SAMPLE_COMMUNITY_POSTS: PublicTrip[] = [
  {
    id: 'comm-1',
    name: '10 Days Across Tokyo, Kyoto & Osaka',
    description:
      'The ultimate Japan food and culture trail! Started with ramen hunting in Shibuya, morning bamboo groves in Arashiyama, and street food feast in Dotonbori. Budget was super manageable with regional rail passes.',
    startDate: '2025-04-10',
    endDate: '2025-04-20',
    coverPhoto: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
    totalBudget: 2400,
    stops: [
      { id: 's1', cityName: 'Tokyo', country: 'Japan', activities: [{ id: 'a1', name: 'Tsukiji Market', category: 'food', cost: 45 }] },
      { id: 's2', cityName: 'Kyoto', country: 'Japan', activities: [{ id: 'a2', name: 'Fushimi Inari Shrine', category: 'sightseeing', cost: 0 }] },
      { id: 's3', cityName: 'Osaka', country: 'Japan', activities: [{ id: 'a3', name: 'Dotonbori Street Food', category: 'food', cost: 60 }] },
    ],
    createdAt: new Date().toISOString(),
    user: {
      id: 'u1',
      name: 'Maya Tanaka',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      city: 'Kyoto',
      country: 'Japan',
    },
  },
  {
    id: 'comm-2',
    name: 'Classic European Summer: Paris to Rome',
    description:
      'Unforgettable backpacking journey across Western Europe. Louvre at night, sunrise hike up Swiss peaks, and wood-fired pizza near the Trevi fountain. Highly recommend booking museums in advance.',
    startDate: '2025-07-01',
    endDate: '2025-07-14',
    coverPhoto: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
    totalBudget: 3200,
    stops: [
      { id: 's4', cityName: 'Paris', country: 'France', activities: [{ id: 'a4', name: 'Eiffel Tower', category: 'sightseeing', cost: 70 }] },
      { id: 's5', cityName: 'Zurich', country: 'Switzerland', activities: [{ id: 'a5', name: 'Lake Boat Tour', category: 'sightseeing', cost: 50 }] },
      { id: 's6', cityName: 'Rome', country: 'Italy', activities: [{ id: 'a6', name: 'Colosseum', category: 'sightseeing', cost: 65 }] },
    ],
    createdAt: new Date().toISOString(),
    user: {
      id: 'u2',
      name: 'Liam Vance',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      city: 'London',
      country: 'UK',
    },
  },
]

export default function CommunityClient({ initialTrips, userTrips, currentUserId }: Props) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRegion, setFilterRegion] = useState('All')
  const [sortBy, setSortBy] = useState<'newest' | 'budget'>('newest')
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({})
  const [publishModalOpen, setPublishModalOpen] = useState(false)

  // Merge real public trips with sample community posts
  const allPosts = useMemo(() => {
    const combined = [...initialTrips, ...SAMPLE_COMMUNITY_POSTS]
    // deduplicate by id
    const unique = Array.from(new Map(combined.map((t) => [t.id, t])).values())
    return unique
  }, [initialTrips])

  const filteredPosts = useMemo(() => {
    let list = [...allPosts]

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q)) ||
          t.user.name?.toLowerCase().includes(q) ||
          t.stops.some((s) => s.cityName.toLowerCase().includes(q) || s.country?.toLowerCase().includes(q))
      )
    }

    if (sortBy === 'budget') {
      list.sort((a, b) => b.totalBudget - a.totalBudget)
    }

    return list
  }, [allPosts, searchQuery, sortBy])

  const toggleLike = (id: string) => {
    setLikedPosts((prev) => ({ ...prev, [id]: !prev[id] }))
    toast.success(likedPosts[id] ? 'Removed like' : 'Liked story! ❤️')
  }

  const handlePublishTrip = async (tripId: string) => {
    try {
      const res = await fetch(`/api/trips/${tripId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic: true }),
      })
      if (res.ok) {
        toast.success('Trip published to the community!')
        setPublishModalOpen(false)
        router.refresh()
      } else {
        toast.error('Failed to publish trip')
      }
    } catch {
      toast.error('Error publishing trip')
    }
  }

  return (
    <div className="space-y-8 animate-in max-w-5xl mx-auto pb-16">
      {/* Screen Title & Header */}
      <div className="border-b border-border/80 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-3xl text-text flex items-center gap-2.5">
            <Compass size={28} className="text-primary" />
            Community tab
          </h1>
          <p className="text-muted text-sm mt-0.5">
            Explore shared travel adventures, tips, and itineraries from travelers worldwide
          </p>
        </div>
        <button
          onClick={() => setPublishModalOpen(true)}
          className="btn-primary flex items-center gap-2 text-sm py-2.5 px-5"
        >
          <Send size={15} /> Share My Trip
        </button>
      </div>

      {/* Wireframe Callout Box (Matching Screen 10 wireframe description) */}
      <div className="card !p-4 border-l-4 border-primary bg-primary/5 text-xs text-muted leading-relaxed">
        <p className="font-semibold text-text mb-1">🌍 Community Hub:</p>
        Community section where all the users can share their experience about a certain trip or
        activity. Using the search, group by or filter and sortby option, the user can narrow down the
        result that he is looking for...
      </div>

      {/* Control Bar (Screen 10 wireframe) */}
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
            placeholder="Search bar ...... (search destination, experience, author)"
            className="input-base input-icon-left !py-2.5 text-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex items-center">
            <Layers size={15} className="absolute left-3 text-muted pointer-events-none" />
            <select
              value={filterRegion}
              onChange={(e) => setFilterRegion(e.target.value)}
              className="input-base !py-2.5 !pl-9 !pr-8 text-xs font-medium cursor-pointer"
            >
              <option value="All">Group by: All Feeds</option>
              <option value="Trending">Group by: Trending</option>
              <option value="Food">Group by: Food & Dining</option>
              <option value="Adventure">Group by: Adventure</option>
            </select>
          </div>

          <div className="relative flex items-center">
            <ArrowUpDown size={15} className="absolute left-3 text-muted pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="input-base !py-2.5 !pl-9 !pr-8 text-xs font-medium cursor-pointer"
            >
              <option value="newest">Sort by: Newest Stories</option>
              <option value="budget">Sort by: Budget</option>
            </select>
          </div>
        </div>
      </div>

      {/* Community Feed (Screen 10 wireframe layout: Left Avatar Circle + Right Card) */}
      <div className="space-y-6">
        {filteredPosts.map((trip) => {
          const totalCost = trip.stops
            .flatMap((s) => s.activities)
            .reduce((sum, a) => sum + a.cost, 0)
          const isLiked = !!likedPosts[trip.id]

          return (
            <div
              key={trip.id}
              className="flex flex-col sm:flex-row items-start gap-4 p-2 rounded-2xl transition-all"
            >
              {/* Left: Circular User Avatar (Screen 10 wireframe) */}
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-primary/30 to-secondary/30 border-2 border-primary/50 flex items-center justify-center text-lg font-bold text-primary flex-shrink-0 overflow-hidden shadow-md">
                {trip.user.image ? (
                  <img src={trip.user.image} alt={trip.user.name || 'User'} className="w-full h-full object-cover" />
                ) : (
                  trip.user.name?.charAt(0)?.toUpperCase() || 'U'
                )}
              </div>

              {/* Right: Rich Experience Card (Screen 10 wireframe) */}
              <div className="flex-1 w-full card space-y-3.5 border border-border hover:border-primary/50 transition-all shadow-xl bg-surface">
                {/* Author row */}
                <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
                  <div>
                    <p className="font-heading font-bold text-sm text-text">{trip.user.name || 'Anonymous Traveler'}</p>
                    <p className="text-muted text-xs">
                      {[trip.user.city, trip.user.country].filter(Boolean).join(', ') || 'Global Explorer'}
                    </p>
                  </div>
                  <span className="badge bg-primary/10 text-primary text-xs font-semibold">
                    {trip.stops.length} Stops
                  </span>
                </div>

                {/* Trip Title & Description */}
                <div>
                  <h3 className="font-heading font-black text-xl text-text hover:text-primary transition-colors">
                    {trip.name}
                  </h3>
                  {trip.description && (
                    <p className="text-muted text-sm mt-1.5 leading-relaxed">
                      {trip.description}
                    </p>
                  )}
                </div>

                {/* Stops trail */}
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span className="text-muted font-medium">Destinations:</span>
                  {trip.stops.map((s) => (
                    <span key={s.id} className="badge bg-surface2 text-text border border-border">
                      {getCountryFlag(s.country || '')} {s.cityName}
                    </span>
                  ))}
                </div>

                {/* Footer Meta & Interaction Buttons */}
                <div className="flex items-center justify-between border-t border-border/50 pt-3 text-xs">
                  <div className="flex items-center gap-4 text-muted">
                    {trip.startDate && (
                      <span className="flex items-center gap-1">
                        <Calendar size={13} /> {formatDate(trip.startDate)}
                      </span>
                    )}
                    <span className="text-secondary font-bold">
                      Spend: {formatCurrency(totalCost || trip.totalBudget)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleLike(trip.id)}
                      className={`flex items-center gap-1 font-semibold transition-colors ${
                        isLiked ? 'text-danger' : 'text-muted hover:text-danger'
                      }`}
                    >
                      <Heart size={15} className={isLiked ? 'fill-danger' : ''} />
                      <span>{isLiked ? 1 : 0}</span>
                    </button>
                    <Link
                      href={`/itinerary/${trip.id}`}
                      className="btn-primary text-xs py-1.5 px-3.5 flex items-center gap-1 font-semibold"
                    >
                      <Eye size={13} /> View Plan
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Share/Publish Trip Modal */}
      {publishModalOpen && (
        <div className="modal-backdrop" onClick={() => setPublishModalOpen(false)}>
          <div className="modal-box !max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-heading font-bold text-xl text-text">Share a Trip to Community</h2>
            <p className="text-muted text-xs">
              Select one of your trips to publish and inspire other travelers:
            </p>

            {userTrips.length === 0 ? (
              <p className="text-muted text-sm py-4 text-center">You haven&apos;t created any trips yet.</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {userTrips.map((t) => (
                  <div key={t.id} className="flex items-center justify-between p-3 bg-surface2 rounded-xl">
                    <span className="font-semibold text-sm truncate">{t.name}</span>
                    <button
                      onClick={() => handlePublishTrip(t.id)}
                      className="btn-primary text-xs py-1.5 px-3"
                    >
                      {t.isPublic ? 'Republish' : 'Publish'}
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button onClick={() => setPublishModalOpen(false)} className="btn-secondary w-full text-xs py-2">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
