'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'
import {
  Globe,
  Calendar,
  MapPin,
  DollarSign,
  Sparkles,
  Loader2,
  ArrowRight,
  Compass,
  Star,
  Plus,
} from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, getCountryFlag } from '@/lib/helpers'

const SUGGESTIONS = [
  {
    city: 'Paris',
    country: 'France',
    title: 'Eiffel Tower & Seine Cruise',
    category: 'Sightseeing',
    cost: '$85',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80',
    description: 'Iconic architecture and sunset river tour with French dining.',
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
  const prefilledDestination = searchParams.get('destination') || ''

  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: prefilledDestination ? `Trip to ${prefilledDestination}` : '',
    selectedPlace: prefilledDestination,
    startDate: '',
    endDate: '',
    totalBudget: '',
    description: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSelectSuggestion = (s: typeof SUGGESTIONS[0]) => {
    setForm((prev) => ({
      ...prev,
      name: prev.name || `Trip to ${s.city}`,
      selectedPlace: s.city,
      description: prev.description ? `${prev.description}\nMust visit: ${s.title}` : `Must visit: ${s.title}`,
    }))
    toast.success(`Selected ${s.city}!`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error('Trip name is required')
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
      {/* 1. Plan a new trip Form (Matching Screen 4 wireframe) */}
      <div className="card space-y-6 border border-border shadow-2xl">
        <div className="border-b border-border/70 pb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-2">
            <Compass size={13} />
            Step 1 of Planning
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
              placeholder="e.g. European Explorer 2026"
              className="input-base"
              autoFocus
            />
          </div>

          {/* Row 2: Select a Place & Estimated Budget */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="selected-place" className="label-base">
                <MapPin size={14} className="inline mr-1 text-primary" /> Select a Place :
              </label>
              <input
                id="selected-place"
                name="selectedPlace"
                type="text"
                value={form.selectedPlace}
                onChange={handleChange}
                placeholder="e.g. Paris, Tokyo, Bali..."
                className="input-base"
              />
            </div>

            <div>
              <label htmlFor="budget" className="label-base">
                <DollarSign size={14} className="inline mr-1 text-secondary" /> Estimated Budget (USD):
              </label>
              <input
                id="budget"
                name="totalBudget"
                type="number"
                min="0"
                value={form.totalBudget}
                onChange={handleChange}
                placeholder="e.g. 3500"
                className="input-base"
              />
            </div>
          </div>

          {/* Row 3: Start Date & End Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="start-date" className="label-base">
                <Calendar size={14} className="inline mr-1 text-primary" /> Start Date:
              </label>
              <input
                id="start-date"
                name="startDate"
                type="date"
                value={form.startDate}
                onChange={handleChange}
                className="input-base cursor-pointer"
              />
            </div>

            <div>
              <label htmlFor="end-date" className="label-base">
                <Calendar size={14} className="inline mr-1 text-primary" /> End Date:
              </label>
              <input
                id="end-date"
                name="endDate"
                type="date"
                value={form.endDate}
                onChange={handleChange}
                className="input-base cursor-pointer"
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex justify-end">
            <button
              id="submit-plan-trip-btn"
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center gap-2 py-3 px-8 text-base font-semibold shadow-lg shadow-primary/20"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  Build Itinerary
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 2. Suggestion for Places to Visit / Activities to perform (Screen 4 Wireframe) */}
      <div className="space-y-4">
        <div className="border-b border-border/70 pb-3">
          <h2 className="font-heading font-bold text-2xl text-text flex items-center gap-2">
            <Sparkles size={20} className="text-secondary" />
            Suggestion for Places to Visit / Activities to perform
          </h2>
          <p className="text-muted text-xs mt-1">
            Click any recommendation below to auto-select and plan for that destination
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SUGGESTIONS.map((s, idx) => (
            <div
              key={idx}
              onClick={() => handleSelectSuggestion(s)}
              className="card !p-0 overflow-hidden group hover:border-primary/60 transition-all hover:-translate-y-1 shadow-lg cursor-pointer"
            >
              {/* Card Image */}
              <div className="h-40 relative overflow-hidden bg-surface2">
                <img
                  src={s.image}
                  alt={s.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
                <span className="absolute top-3 left-3 badge bg-primary/90 text-bg font-bold backdrop-blur-md">
                  {s.category}
                </span>
                <span className="absolute top-3 right-3 badge bg-surface/90 text-secondary font-bold backdrop-blur-md border border-border">
                  Avg {s.cost}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-2">
                <div className="flex items-center gap-1.5 text-xs text-muted">
                  <MapPin size={12} className="text-primary" />
                  <span>{s.city}, {s.country}</span>
                </div>
                <h3 className="font-heading font-semibold text-base text-text group-hover:text-primary transition-colors">
                  {s.title}
                </h3>
                <p className="text-muted text-xs line-clamp-2 leading-relaxed">
                  {s.description}
                </p>

                <div className="pt-2 flex items-center justify-between border-t border-border/50 text-xs">
                  <span className="text-primary font-semibold flex items-center gap-1">
                    <Plus size={13} /> Select this Place
                  </span>
                  <span className="text-muted text-[11px]">Click to pick</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
