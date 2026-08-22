'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  MapPin,
  Clock,
  DollarSign,
  Eye,
  BarChart2,
  Calendar,
  Loader2,
  ArrowLeft,
  Sparkles,
  Plane,
  Hotel,
  Compass,
  FileText,
} from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, formatDate, getCountryFlag, CATEGORY_CONFIG } from '@/lib/helpers'
import CitySearchModal from '@/components/CitySearchModal'
import ActivityModal from '@/components/ActivityModal'

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
  orderIndex: number
  costIndex: number
  activities: Activity[]
}

interface Trip {
  id: string
  name: string
  description?: string | null
  startDate?: string | null
  endDate?: string | null
  isPublic: boolean
  totalBudget: number
  stops: Stop[]
}

export default function BuildItineraryScreen({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)
  const [cityModalOpen, setCityModalOpen] = useState(false)
  const [actModalOpen, setActModalOpen] = useState<string | null>(null)

  const fetchTrip = useCallback(async () => {
    const res = await fetch(`/api/trips/${params.id}`)
    if (res.ok) {
      const data = await res.json()
      setTrip(data)
    } else {
      toast.error('Failed to load trip')
    }
    setLoading(false)
  }, [params.id])

  useEffect(() => {
    fetchTrip()
  }, [fetchTrip])

  const handleAddCity = async (city: { name: string; country: string; costIndex: number }) => {
    const res = await fetch(`/api/trips/${params.id}/stops`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cityName: city.name,
        country: city.country,
        costIndex: city.costIndex,
      }),
    })
    if (res.ok) {
      toast.success(`Section for ${city.name} added!`)
      fetchTrip()
      setCityModalOpen(false)
    } else {
      toast.error('Failed to add section')
    }
  }

  const handleDeleteStop = async (stopId: string) => {
    const res = await fetch(`/api/stops/${stopId}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Section removed')
      fetchTrip()
    } else {
      toast.error('Failed to remove section')
    }
  }

  const handleMoveStop = async (stop: Stop, dir: 'up' | 'down') => {
    const stops = trip!.stops
    const idx = stops.findIndex((s) => s.id === stop.id)
    const newIdx = dir === 'up' ? idx - 1 : idx + 1
    if (newIdx < 0 || newIdx >= stops.length) return

    await fetch(`/api/stops/${stop.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...stop, orderIndex: newIdx }),
    })
    await fetch(`/api/stops/${stops[newIdx].id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...stops[newIdx], orderIndex: idx }),
    })
    fetchTrip()
  }

  const handleAddActivity = async (stopId: string, data: any) => {
    const res = await fetch(`/api/stops/${stopId}/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      toast.success('Activity added!')
      fetchTrip()
      setActModalOpen(null)
    } else {
      toast.error('Failed to add activity')
    }
  }

  const handleDeleteActivity = async (actId: string) => {
    const res = await fetch(`/api/activities/${actId}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Activity removed')
      fetchTrip()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 size={40} className="text-primary animate-spin" />
      </div>
    )
  }

  if (!trip) return <div className="card text-center py-20 text-muted">Trip not found</div>

  const totalCost = trip.stops
    .flatMap((s) => s.activities)
    .reduce((sum, a) => sum + a.cost, 0)

  return (
    <div className="max-w-4xl mx-auto animate-in space-y-8 pb-16">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <Link
            href="/trips"
            className="flex items-center gap-1.5 text-muted hover:text-text text-xs mb-2 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Trip Listing
          </Link>
          <h1 className="font-heading font-black text-3xl text-text flex items-center gap-2.5">
            <Compass size={28} className="text-primary" />
            Build Itinerary Screen
          </h1>
          <p className="text-muted text-sm mt-0.5 font-medium">{trip.name}</p>
        </div>

        {/* View mode actions */}
        <div className="flex items-center gap-2">
          <Link
            href={`/trips/${params.id}/view`}
            className="btn-secondary flex items-center gap-1.5 text-xs py-2 px-3.5"
          >
            <Eye size={14} /> View Plan
          </Link>
          <Link
            href={`/trips/${params.id}/budget`}
            className="btn-secondary flex items-center gap-1.5 text-xs py-2 px-3.5 text-secondary"
          >
            <BarChart2 size={14} /> Budget
          </Link>
          <Link
            href={`/trips/${params.id}/timeline`}
            className="btn-secondary flex items-center gap-1.5 text-xs py-2 px-3.5"
          >
            <Calendar size={14} /> Timeline
          </Link>
        </div>
      </div>

      {/* Sections List (Matching Screen 5 wireframe) */}
      <div className="space-y-6">
        {trip.stops.length === 0 ? (
          <div className="card text-center py-16 border-dashed border-2">
            <div className="text-5xl mb-3">📍</div>
            <h2 className="font-heading font-bold text-xl mb-1">No itinerary sections added yet</h2>
            <p className="text-muted text-sm mb-6">
              Click below to add your first travel section (city, hotel, flight, or activity stop).
            </p>
            <button
              onClick={() => setCityModalOpen(true)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus size={16} /> Add First Section
            </button>
          </div>
        ) : (
          trip.stops.map((stop, idx) => {
            const sectionBudget = stop.activities.reduce((sum, a) => sum + a.cost, 0)
            const dateRangeStr =
              stop.arrivalDate && stop.departureDate
                ? `${formatDate(stop.arrivalDate)} to ${formatDate(stop.departureDate)}`
                : trip.startDate && trip.endDate
                ? `${formatDate(trip.startDate)} to ${formatDate(trip.endDate)}`
                : 'Dates to be specified'

            return (
              <div
                key={stop.id}
                className="card space-y-4 border border-border/90 hover:border-primary/50 transition-all shadow-xl backdrop-blur-md"
              >
                {/* Section Header & Reorder controls */}
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                      {idx + 1}
                    </span>
                    <div>
                      <h2 className="font-heading font-bold text-xl text-text flex items-center gap-2">
                        Section {idx + 1}: {getCountryFlag(stop.country || '')} {stop.cityName}
                      </h2>
                      <span className="text-muted text-xs">{stop.country || 'Destination'}</span>
                    </div>
                  </div>

                  {/* Reorder and Delete Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleMoveStop(stop, 'up')}
                      disabled={idx === 0}
                      className="p-1.5 hover:bg-surface2 rounded-lg disabled:opacity-20 transition-colors text-muted hover:text-text"
                      title="Move Up"
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      onClick={() => handleMoveStop(stop, 'down')}
                      disabled={idx === trip.stops.length - 1}
                      className="p-1.5 hover:bg-surface2 rounded-lg disabled:opacity-20 transition-colors text-muted hover:text-text"
                      title="Move Down"
                    >
                      <ChevronDown size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteStop(stop.id)}
                      className="p-1.5 hover:bg-danger/10 text-danger rounded-lg transition-colors ml-1"
                      title="Delete Section"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Section Description / Info */}
                <p className="text-muted text-sm leading-relaxed">
                  All the necessary information about this section. This can be anything like travel
                  section, hotel, tours, dining, or any other activity for {stop.cityName}.
                </p>

                {/* Section Metadata Boxes: Date Range & Budget (Screen 5 wireframe) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="bg-surface2/80 border border-border/80 rounded-xl px-4 py-3 flex items-center gap-2.5">
                    <Calendar size={16} className="text-primary flex-shrink-0" />
                    <div>
                      <span className="text-[11px] text-muted uppercase font-semibold tracking-wider block">
                        Date Range:
                      </span>
                      <span className="text-sm font-medium text-text">{dateRangeStr}</span>
                    </div>
                  </div>

                  <div className="bg-surface2/80 border border-border/80 rounded-xl px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <DollarSign size={16} className="text-secondary flex-shrink-0" />
                      <div>
                        <span className="text-[11px] text-muted uppercase font-semibold tracking-wider block">
                          Budget of this section:
                        </span>
                        <span className="text-sm font-bold text-secondary">
                          {formatCurrency(sectionBudget)}
                        </span>
                      </div>
                    </div>
                    <span className="badge bg-secondary/10 text-secondary text-xs">
                      {stop.activities.length} item{stop.activities.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* List of Section Activities */}
                {stop.activities.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-border/40">
                    {stop.activities.map((act) => {
                      const cat = CATEGORY_CONFIG[act.category] || CATEGORY_CONFIG.other
                      return (
                        <div
                          key={act.id}
                          className="flex items-center gap-3 p-3 bg-surface2/50 hover:bg-surface2 rounded-xl group border border-transparent hover:border-border transition-all"
                        >
                          <span className="text-lg">{cat.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate">{act.name}</p>
                            <div className="flex items-center gap-2.5 mt-0.5 text-xs text-muted">
                              <span className={`badge ${cat.color} text-[11px]`}>{cat.label}</span>
                              {act.scheduledTime && (
                                <span className="flex items-center gap-1">
                                  <Clock size={11} /> {act.scheduledTime}
                                </span>
                              )}
                              <span>Day {act.dayNumber}</span>
                            </div>
                          </div>
                          <span className="text-secondary font-bold text-sm">
                            {formatCurrency(act.cost)}
                          </span>
                          <button
                            onClick={() => handleDeleteActivity(act.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-danger/10 text-danger rounded-lg transition-all"
                            title="Remove item"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Add activity to section */}
                <div className="pt-2 flex justify-start">
                  <button
                    onClick={() => setActModalOpen(stop.id)}
                    className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5 font-medium"
                  >
                    <Plus size={13} /> Add Activity / Hotel to this Section
                  </button>
                </div>
              </div>
            )
          })
        )}

        {/* "+ Add another Section" Button (Screen 5 wireframe) */}
        <button
          id="add-another-section-btn"
          onClick={() => setCityModalOpen(true)}
          className="w-full py-4 rounded-2xl border-2 border-dashed border-primary/50 bg-primary/5 hover:bg-primary/10 text-primary font-heading font-bold text-base flex items-center justify-center gap-2 hover:border-primary transition-all cursor-pointer shadow-sm hover:shadow-lg hover:shadow-primary/10"
        >
          <Plus size={20} />
          + Add another Section
        </button>
      </div>

      {/* Modals */}
      {cityModalOpen && (
        <CitySearchModal onClose={() => setCityModalOpen(false)} onAdd={handleAddCity} />
      )}
      {actModalOpen && (
        <ActivityModal
          stopId={actModalOpen}
          onClose={() => setActModalOpen(null)}
          onAdd={(data) => handleAddActivity(actModalOpen, data)}
        />
      )}
    </div>
  )
}
