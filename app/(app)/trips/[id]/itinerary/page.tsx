'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import {
  Plus, Trash2, ChevronUp, ChevronDown, MapPin, Clock,
  DollarSign, Eye, BarChart2, Calendar, Share2, Loader2, ArrowLeft
} from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, formatDate, getCountryFlag, CATEGORY_CONFIG } from '@/lib/helpers'
import CitySearchModal from '@/components/CitySearchModal'
import ActivityModal from '@/components/ActivityModal'

interface Activity {
  id: string; name: string; category: string; cost: number;
  scheduledTime?: string | null; dayNumber: number; durationHours?: number | null; description?: string | null
}
interface Stop {
  id: string; cityName: string; country?: string | null;
  arrivalDate?: string | null; departureDate?: string | null; orderIndex: number; activities: Activity[]
}
interface Trip {
  id: string; name: string; startDate?: string | null; endDate?: string | null;
  isPublic: boolean; totalBudget: number; stops: Stop[]
}

export default function ItineraryBuilder({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)
  const [cityModalOpen, setCityModalOpen] = useState(false)
  const [actModalOpen, setActModalOpen] = useState<string | null>(null)
  const [expandedStops, setExpandedStops] = useState<Set<string>>(new Set())

  const fetchTrip = useCallback(async () => {
    const res = await fetch(`/api/trips/${params.id}`)
    if (res.ok) {
      const data = await res.json()
      setTrip(data)
      setExpandedStops(new Set(data.stops.map((s: Stop) => s.id)))
    } else {
      toast.error('Failed to load trip')
    }
    setLoading(false)
  }, [params.id])

  useEffect(() => { fetchTrip() }, [fetchTrip])

  const handleAddCity = async (city: { name: string; country: string; costIndex: number }) => {
    const res = await fetch(`/api/trips/${params.id}/stops`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cityName: city.name, country: city.country, costIndex: city.costIndex }),
    })
    if (res.ok) {
      toast.success(`${city.name} added!`)
      fetchTrip()
      setCityModalOpen(false)
    } else {
      toast.error('Failed to add city')
    }
  }

  const handleDeleteStop = async (stopId: string) => {
    if (!confirm('Remove this city and all its activities?')) return
    const res = await fetch(`/api/stops/${stopId}`, { method: 'DELETE' })
    if (res.ok) { toast.success('City removed'); fetchTrip() }
    else toast.error('Failed to remove')
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
    if (res.ok) { toast.success('Activity added!'); fetchTrip(); setActModalOpen(null) }
    else toast.error('Failed to add activity')
  }

  const handleDeleteActivity = async (actId: string) => {
    const res = await fetch(`/api/activities/${actId}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Removed'); fetchTrip() }
  }

  const toggleStop = (id: string) => {
    setExpandedStops((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
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
    <div className="max-w-4xl mx-auto animate-in">
      {/* Header */}
      <div className="mb-8">
        <Link href="/trips" className="flex items-center gap-2 text-muted hover:text-text text-sm mb-4 transition-colors">
          <ArrowLeft size={15} /> Back to My Trips
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-heading font-bold text-3xl">{trip.name}</h1>
            {trip.startDate && (
              <p className="text-muted mt-1">{formatDate(trip.startDate)} – {trip.endDate ? formatDate(trip.endDate) : 'TBD'}</p>
            )}
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Link href={`/trips/${params.id}/view`} className="btn-secondary flex items-center gap-2 text-sm py-2">
              <Eye size={15} /> View
            </Link>
            <Link href={`/trips/${params.id}/budget`} className="btn-secondary flex items-center gap-2 text-sm py-2">
              <BarChart2 size={15} /> Budget
            </Link>
            <Link href={`/trips/${params.id}/timeline`} className="btn-secondary flex items-center gap-2 text-sm py-2">
              <Calendar size={15} /> Timeline
            </Link>
          </div>
        </div>

        {/* Summary bar */}
        <div className="flex items-center gap-6 mt-4 p-4 bg-surface2 rounded-xl border border-border">
          <div className="flex items-center gap-2 text-sm">
            <MapPin size={15} className="text-primary" />
            <span className="text-muted">{trip.stops.length} {trip.stops.length === 1 ? 'city' : 'cities'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <DollarSign size={15} className="text-secondary" />
            <span className="text-muted">Total: <strong className="text-secondary">{formatCurrency(totalCost)}</strong></span>
          </div>
          {trip.totalBudget > 0 && (
            <div className={`text-sm ${totalCost > trip.totalBudget ? 'text-danger' : 'text-primary'}`}>
              Budget: {formatCurrency(trip.totalBudget)}
              {totalCost > trip.totalBudget && ' ⚠️ Over budget!'}
            </div>
          )}
        </div>
      </div>

      {/* Stops */}
      <div className="space-y-4">
        {trip.stops.length === 0 ? (
          <div className="card text-center py-16">
            <div className="text-5xl mb-4">🗺️</div>
            <h3 className="font-heading font-bold text-xl mb-2">No cities added yet</h3>
            <p className="text-muted mb-6">Click "Add City" to start building your itinerary</p>
          </div>
        ) : (
          trip.stops.map((stop, idx) => (
            <div key={stop.id} className="card border-border hover:border-primary/30 transition-colors">
              {/* Stop header */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                  {idx + 1}
                </div>
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => toggleStop(stop.id)}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getCountryFlag(stop.country || '')}</span>
                    <h3 className="font-heading font-semibold text-lg">{stop.cityName}</h3>
                    <span className="text-muted text-sm">{stop.country}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-muted">
                    {stop.arrivalDate && <span>✈️ {formatDate(stop.arrivalDate)}</span>}
                    <span>📌 {stop.activities.length} activities</span>
                    <span className="text-secondary">{formatCurrency(stop.activities.reduce((s, a) => s + a.cost, 0))}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleMoveStop(stop, 'up')} disabled={idx === 0} className="p-1.5 hover:bg-surface2 rounded-lg disabled:opacity-30 transition-colors">
                    <ChevronUp size={16} />
                  </button>
                  <button onClick={() => handleMoveStop(stop, 'down')} disabled={idx === trip.stops.length - 1} className="p-1.5 hover:bg-surface2 rounded-lg disabled:opacity-30 transition-colors">
                    <ChevronDown size={16} />
                  </button>
                  <button onClick={() => handleDeleteStop(stop.id)} className="p-1.5 hover:bg-danger/10 text-danger rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Activities */}
              {expandedStops.has(stop.id) && (
                <div className="mt-4 pl-11">
                  {stop.activities.length === 0 ? (
                    <p className="text-muted text-sm">No activities yet. Add your first one!</p>
                  ) : (
                    <div className="space-y-2 mb-3">
                      {stop.activities.map((act) => {
                        const cat = CATEGORY_CONFIG[act.category] || CATEGORY_CONFIG.other
                        return (
                          <div key={act.id} className="flex items-center gap-3 p-3 bg-surface2 rounded-xl group hover:bg-surface border border-transparent hover:border-border transition-all">
                            <span className="text-lg">{cat.emoji}</span>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{act.name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className={`badge text-xs ${cat.color}`}>{cat.label}</span>
                                {act.scheduledTime && (
                                  <span className="text-muted text-xs flex items-center gap-1">
                                    <Clock size={11} /> {act.scheduledTime}
                                  </span>
                                )}
                                {act.dayNumber > 1 && <span className="text-muted text-xs">Day {act.dayNumber}</span>}
                              </div>
                            </div>
                            <span className="text-secondary font-semibold text-sm">{formatCurrency(act.cost)}</span>
                            <button
                              onClick={() => handleDeleteActivity(act.id)}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-danger/10 text-danger rounded-lg transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                  <button
                    id={`add-activity-${stop.id}`}
                    onClick={() => setActModalOpen(stop.id)}
                    className="btn-secondary flex items-center gap-2 text-sm py-2 mt-2"
                  >
                    <Plus size={14} /> Add Activity
                  </button>
                </div>
              )}
            </div>
          ))
        )}

        {/* Add city button */}
        <button
          id="add-city-btn"
          onClick={() => setCityModalOpen(true)}
          className="btn-primary w-full flex items-center justify-center gap-2 py-4"
        >
          <Plus size={18} /> Add City / Stop
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
