'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Sparkles,
  Calendar,
  DollarSign,
  MapPin,
  FileText,
  Compass,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Zap,
  Bot,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Recommendation {
  city: string
  country: string
  title: string
  category: string
  cost: string
  image: string
  description: string
}

const RECOMMENDATIONS: Recommendation[] = [
  {
    city: 'Paris',
    country: 'France',
    title: 'Eiffel Sunset & Louvre Highlights',
    category: 'Romantic & Culture',
    cost: '$85',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80',
    description: 'Iconic architecture, romantic Seine cruise, and world-renowned museum collections.',
  },
  {
    city: 'Tokyo',
    country: 'Japan',
    title: 'Tsukiji Market & Shinjuku Neon',
    category: 'Food & Culture',
    cost: '$60',
    image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80',
    description: 'Fresh sushi tasting, historic shrines, and vibrant cyberpunk alleys.',
  },
  {
    city: 'Rome',
    country: 'Italy',
    title: 'Colosseum & Vatican Museums',
    category: 'History',
    cost: '$75',
    image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&q=80',
    description: 'Walk in the footsteps of gladiators and discover Renaissance art.',
  },
  {
    city: 'Bali',
    country: 'Indonesia',
    title: 'Ubud Rice Terraces & Waterfalls',
    category: 'Adventure',
    cost: '$40',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80',
    description: 'Lush tropical jungles, sacred monkey forests, and beach clubs.',
  },
  {
    city: 'New York',
    country: 'USA',
    title: 'Broadway & Central Park Stroll',
    category: 'Entertainment',
    cost: '$150',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=600&q=80',
    description: 'World-class theatrical shows, skyline views, and cultural landmarks.',
  },
  {
    city: 'Prague',
    country: 'Czech Republic',
    title: 'Charles Bridge & Old Town Square',
    category: 'Sightseeing',
    cost: '$45',
    image: 'https://images.unsplash.com/photo-1541849546-216549ae216d?auto=format&fit=crop&w=600&q=80',
    description: 'Gothic towers, historic astronomical clock, and Bohemian taverns.',
  },
]

export default function CreateTripPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [form, setForm] = useState({
    name: '',
    selectedPlace: '',
    startDate: '',
    endDate: '',
    totalBudget: '',
    description: '',
  })
  const [loading, setLoading] = useState(false)
  const [aiCity, setAiCity] = useState('')
  const [aiDays, setAiDays] = useState(3)
  const [aiStyle, setAiStyle] = useState('balanced')
  const [aiLoading, setAiLoading] = useState(false)

  // Auto populate destination if query param provided (e.g. from Explore or GlobeBot)
  useEffect(() => {
    const dest = searchParams.get('destination')
    if (dest) {
      setForm((prev) => ({
        ...prev,
        selectedPlace: dest,
        name: prev.name || `Trip to ${dest}`,
      }))
    }
  }, [searchParams])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSelectRecommendation = (s: Recommendation) => {
    setForm((prev) => ({
      ...prev,
      name: prev.name || `Trip to ${s.city}`,
      selectedPlace: s.city,
      description: prev.description ? `${prev.description}\nMust visit: ${s.title}` : `Must visit: ${s.title}`,
    }))
    toast.success(`Selected ${s.city}!`)
  }

  const handleAiAutoGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!aiCity.trim()) {
      toast.error('Please enter a destination city or country')
      return
    }

    setAiLoading(true)
    try {
      const res = await fetch('/api/ai/generate-trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: aiCity.trim(),
          days: aiDays,
          style: aiStyle,
          autoSave: true,
        }),
      })

      const data = await res.json()
      if (res.ok && data.tripId) {
        toast.success(`✨ ${aiDays}-Day trip to ${aiCity} generated & saved!`)
        router.push(`/trips/${data.tripId}/itinerary`)
      } else {
        toast.error(data.error || 'Failed to auto-generate trip')
      }
    } catch {
      toast.error('Failed to generate trip')
    } finally {
      setAiLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error('Please enter a trip name')
      return
    }
    if (form.startDate && form.endDate && new Date(form.endDate) < new Date(form.startDate)) {
      toast.error('End date cannot be earlier than start date')
      return
    }

    setLoading(true)
    try {
      // 1. Create Trip
      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          startDate: form.startDate || null,
          endDate: form.endDate || null,
          totalBudget: form.totalBudget ? parseFloat(form.totalBudget) : 0,
          description: form.description || null,
          isPublic: false,
        }),
      })

      const trip = await res.json()
      if (!res.ok) throw new Error(trip.error)

      // 2. If a place was selected, automatically create initial stop!
      if (form.selectedPlace.trim()) {
        await fetch(`/api/trips/${trip.id}/stops`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cityName: form.selectedPlace,
            arrivalDate: form.startDate || null,
            departureDate: form.endDate || null,
          }),
        })
      }

      toast.success('Trip created! Redirecting to Itinerary Builder...')
      router.push(`/trips/${trip.id}/itinerary`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to create trip')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-10 animate-in max-w-5xl mx-auto pb-12">
      {/* AI Magic Generator Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-primary/15 via-surface2 to-secondary/15 border border-primary/30 shadow-xl space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary text-bg flex items-center justify-center shadow-md">
              <Zap size={20} />
            </div>
            <div>
              <h2 className="font-heading font-black text-lg text-text flex items-center gap-2">
                AI Magic Auto-Trip Generator
                <span className="badge bg-primary/20 text-primary text-[10px] uppercase font-bold">1-Click</span>
              </h2>
              <p className="text-muted text-xs">Let GlobeBot AI create a complete multi-day itinerary with budget and activities for ANY city</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleAiAutoGenerate} className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
          <div className="sm:col-span-5 relative">
            <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            <input
              type="text"
              value={aiCity}
              onChange={(e) => setAiCity(e.target.value)}
              placeholder="Enter ANY city (e.g. London, Tokyo, Cairo, Bali)..."
              className="input-base !pl-10 !py-2.5 text-xs"
              disabled={aiLoading}
            />
          </div>

          <div className="sm:col-span-2">
            <select
              value={aiDays}
              onChange={(e) => setAiDays(parseInt(e.target.value))}
              className="input-base !py-2.5 text-xs cursor-pointer"
              disabled={aiLoading}
            >
              <option value={2}>2 Days</option>
              <option value={3}>3 Days</option>
              <option value={5}>5 Days</option>
              <option value={7}>7 Days</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <select
              value={aiStyle}
              onChange={(e) => setAiStyle(e.target.value)}
              className="input-base !py-2.5 text-xs cursor-pointer"
              disabled={aiLoading}
            >
              <option value="balanced">Balanced</option>
              <option value="food">Food & Dining</option>
              <option value="cultural">Culture & History</option>
              <option value="adventure">Adventure</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <button
              type="submit"
              disabled={aiLoading || !aiCity.trim()}
              className="btn-primary w-full !py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-primary/20 cursor-pointer disabled:opacity-50"
            >
              {aiLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  ⚡ Auto-Plan Trip
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 1. Plan a new trip Form (Matching Screen 4 wireframe) */}
      <div className="card space-y-6 border border-border shadow-2xl">
        <div className="border-b border-border/70 pb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-2">
            <Compass size={13} />
            Manual Trip Planning
          </div>
          <h1 className="font-heading font-black text-2xl md:text-3xl text-text">Plan a new trip</h1>
          <p className="text-muted text-sm mt-0.5">Enter your trip schedule and primary destinations</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Row 1: Trip Title */}
          <div>
            <label htmlFor="trip-name" className="label-base">
              <Sparkles size={14} className="inline mr-1 text-primary" /> Trip Name:
            </label>
            <input
              id="trip-name"
              name="name"
              type="text"
              required
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. 10 Days in Tokyo & Kyoto, European Summer Adventure..."
              className="input-base"
            />
          </div>

          {/* Row 2: Select a Place / Primary Destination */}
          <div>
            <label htmlFor="trip-place" className="label-base">
              <MapPin size={14} className="inline mr-1 text-primary" /> Select a Place (Primary Destination):
            </label>
            <div className="relative group">
              <MapPin size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" />
              <input
                id="trip-place"
                name="selectedPlace"
                type="text"
                value={form.selectedPlace}
                onChange={handleChange}
                placeholder="e.g. Paris, Tokyo, Rome, Bali, New York..."
                className="input-base input-icon-left"
              />
            </div>
            <p className="text-xs text-muted mt-1.5">
              💡 Tip: Click one of the popular recommendations below or explore global cities to auto-populate!
            </p>
          </div>

          {/* Row 3: Travel Dates (Start Date & End Date) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="trip-start" className="label-base">
                <Calendar size={14} className="inline mr-1 text-primary" /> Start Date:
              </label>
              <input
                id="trip-start"
                name="startDate"
                type="date"
                value={form.startDate}
                onChange={handleChange}
                className="input-base"
              />
            </div>

            <div>
              <label htmlFor="trip-end" className="label-base">
                <Calendar size={14} className="inline mr-1 text-primary" /> End Date:
              </label>
              <input
                id="trip-end"
                name="endDate"
                type="date"
                value={form.endDate}
                onChange={handleChange}
                className="input-base"
              />
            </div>
          </div>

          {/* Row 4: Estimated Budget */}
          <div>
            <label htmlFor="trip-budget" className="label-base">
              <DollarSign size={14} className="inline mr-1 text-secondary" /> Estimated Total Budget ($ USD):
            </label>
            <div className="relative group">
              <DollarSign size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-secondary transition-colors" />
              <input
                id="trip-budget"
                name="totalBudget"
                type="number"
                min="0"
                step="50"
                value={form.totalBudget}
                onChange={handleChange}
                placeholder="e.g. 1500"
                className="input-base input-icon-left"
              />
            </div>
          </div>

          {/* Row 5: Notes & Description */}
          <div>
            <label htmlFor="trip-description" className="label-base">
              <FileText size={14} className="inline mr-1 text-primary" /> Trip Description & Goals:
            </label>
            <textarea
              id="trip-description"
              name="description"
              rows={3}
              value={form.description}
              onChange={handleChange}
              placeholder="What do you want to experience? (e.g. Must try ramen spots, photography at sunrise, historical walking tours...)"
              className="input-base resize-none"
            />
          </div>

          {/* Submit CTA */}
          <div className="pt-2">
            <button
              id="create-trip-submit-btn"
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 text-base font-semibold shadow-lg shadow-primary/25"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  Continue to Itinerary Builder
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 2. Popular Recommendations Grid (Matching Screen 4 wireframe) */}
      <div className="space-y-4">
        <div className="border-b border-border/70 pb-3">
          <h2 className="font-heading font-bold text-2xl text-text flex items-center gap-2">
            <Sparkles size={20} className="text-secondary" />
            Top Recommended Travel Itineraries
          </h2>
          <p className="text-muted text-xs mt-0.5">
            Click any recommendation below to quickly pre-fill your trip plan!
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {RECOMMENDATIONS.map((rec) => {
            const isSelected = form.selectedPlace === rec.city
            return (
              <div
                key={rec.city}
                onClick={() => handleSelectRecommendation(rec)}
                className={`card !p-3.5 cursor-pointer border transition-all duration-300 group hover:scale-[1.02] hover:shadow-xl ${
                  isSelected
                    ? 'border-primary ring-2 ring-primary/30 bg-surface2 shadow-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                {/* Photo */}
                <div className="h-36 rounded-xl overflow-hidden mb-3 relative bg-surface2">
                  <img
                    src={rec.image}
                    alt={rec.city}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80'
                    }}
                  />
                  <div className="absolute top-2 left-2 badge bg-surface/90 text-primary text-[10px] font-bold">
                    {rec.category}
                  </div>
                  <div className="absolute bottom-2 right-2 badge bg-secondary text-bg text-[10px] font-bold">
                    Avg {rec.cost}/day
                  </div>
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary text-bg flex items-center justify-center shadow-md">
                      <CheckCircle2 size={16} />
                    </div>
                  )}
                </div>

                {/* Details */}
                <h3 className="font-heading font-bold text-base text-text group-hover:text-primary transition-colors truncate">
                  {rec.title}
                </h3>
                <p className="text-xs text-primary font-medium mt-0.5">
                  📍 {rec.city}, {rec.country}
                </p>
                <p className="text-xs text-muted line-clamp-2 mt-1.5 leading-relaxed">
                  {rec.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
