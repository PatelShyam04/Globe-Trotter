'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  DollarSign,
  Calendar,
  Eye,
  BarChart2,
  Clock,
  Compass,
  ArrowLeft,
  Sparkles,
  MapPin,
  Edit2,
  Save,
  X,
  Loader2,
} from 'lucide-react'
import { formatCurrency, formatDate, getCountryFlag } from '@/lib/helpers'
import CitySearchModal from '@/components/CitySearchModal'
import ActivityModal from '@/components/ActivityModal'
import toast from 'react-hot-toast'

interface Activity {
  id: string
  name: string
  category: string
  description?: string | null
  cost: number
  durationHours?: number | null
  scheduledTime?: string | null
  dayNumber: number
}

interface Stop {
  id: string
  cityName: string
  country?: string | null
  orderIndex: number
  arrivalDate?: Date | string | null
  departureDate?: Date | string | null
  activities: Activity[]
}

interface Trip {
  id: string
  name: string
  description?: string | null
  startDate?: Date | string | null
  endDate?: Date | string | null
  totalBudget: number
  isPublic: boolean
  stops: Stop[]
}

const CATEGORY_CONFIG: Record<string, { label: string; color: string; emoji: string }> = {
  stay: { label: 'Accommodation', color: 'badge-blue', emoji: '🏨' },
  sightseeing: { label: 'Sightseeing', color: 'badge-primary', emoji: '🏛️' },
  food: { label: 'Food & Dining', color: 'badge-orange', emoji: '🍜' },
  adventure: { label: 'Adventure', color: 'badge-purple', emoji: '🏄' },
  transport: { label: 'Transport', color: 'badge-green', emoji: '🚆' },
  other: { label: 'General', color: 'badge-blue', emoji: '✨' },
}

export default function ItineraryPage() {
  const params = useParams()
  const router = useRouter()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)
  const [cityModalOpen, setCityModalOpen] = useState(false)
  const [actModalOpen, setActModalOpen] = useState<string | null>(null)

  // Edit Section / Stop Modal State
  const [editingStop, setEditingStop] = useState<Stop | null>(null)
  const [stopForm, setStopForm] = useState({
    cityName: '',
    country: '',
    arrivalDate: '',
    departureDate: '',
  })

  // Edit Trip Modal State
  const [isTripEditOpen, setIsTripEditOpen] = useState(false)
  const [tripForm, setTripForm] = useState({
    name: '',
    startDate: '',
    endDate: '',
    totalBudget: 0,
    description: '',
  })

  // Edit Activity Modal State
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)
  const [actForm, setActForm] = useState({
    name: '',
    category: 'sightseeing',
    cost: 0,
    scheduledTime: '',
    dayNumber: 1,
    description: '',
  })

  const [savingEdit, setSavingEdit] = useState(false)

  const fetchTrip = useCallback(async () => {
    try {
      const res = await fetch(`/api/trips/${params.id}`)
      if (!res.ok) {
        toast.error('Trip not found')
        router.push('/trips')
        return
      }
      const data = await res.json()
      setTrip(data)
      setTripForm({
        name: data.name || '',
        startDate: data.startDate ? new Date(data.startDate).toISOString().split('T')[0] : '',
        endDate: data.endDate ? new Date(data.endDate).toISOString().split('T')[0] : '',
        totalBudget: data.totalBudget || 0,
        description: data.description || '',
      })
    } catch {
      toast.error('Failed to load trip')
    } finally {
      setLoading(false)
    }
  }, [params.id, router])

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

  const handleOpenEditStop = (stop: Stop) => {
    setEditingStop(stop)
    setStopForm({
      cityName: stop.cityName || '',
      country: stop.country || '',
      arrivalDate: stop.arrivalDate ? new Date(stop.arrivalDate).toISOString().split('T')[0] : '',
      departureDate: stop.departureDate ? new Date(stop.departureDate).toISOString().split('T')[0] : '',
    })
  }

  const handleSaveStop = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingStop) return
    setSavingEdit(true)
    try {
      const res = await fetch(`/api/stops/${editingStop.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cityName: stopForm.cityName,
          country: stopForm.country,
          arrivalDate: stopForm.arrivalDate || null,
          departureDate: stopForm.departureDate || null,
        }),
      })
      if (res.ok) {
        toast.success('Section updated!')
        setEditingStop(null)
        fetchTrip()
      } else {
        toast.error('Failed to update section')
      }
    } catch {
      toast.error('Error updating section')
    } finally {
      setSavingEdit(false)
    }
  }

  const handleSaveTrip = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingEdit(true)
    try {
      const res = await fetch(`/api/trips/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: tripForm.name,
          startDate: tripForm.startDate || null,
          endDate: tripForm.endDate || null,
          totalBudget: parseFloat(tripForm.totalBudget.toString()) || 0,
          description: tripForm.description || null,
        }),
      })
      if (res.ok) {
        toast.success('Trip details updated!')
        setIsTripEditOpen(false)
        fetchTrip()
      } else {
        toast.error('Failed to update trip')
      }
    } catch {
      toast.error('Error updating trip')
    } finally {
      setSavingEdit(false)
    }
  }

  const handleOpenEditActivity = (act: Activity) => {
    setEditingActivity(act)
    setActForm({
      name: act.name || '',
      category: act.category || 'sightseeing',
      cost: act.cost || 0,
      scheduledTime: act.scheduledTime || '',
      dayNumber: act.dayNumber || 1,
      description: act.description || '',
    })
  }

  const handleSaveActivity = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingActivity) return
    setSavingEdit(true)
    try {
      const res = await fetch(`/api/activities/${editingActivity.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: actForm.name,
          category: actForm.category,
          cost: parseFloat(actForm.cost.toString()) || 0,
          scheduledTime: actForm.scheduledTime || null,
          dayNumber: parseInt(actForm.dayNumber.toString()) || 1,
          description: actForm.description || null,
        }),
      })
      if (res.ok) {
        toast.success('Activity updated!')
        setEditingActivity(null)
        fetchTrip()
      } else {
        toast.error('Failed to update activity')
      }
    } catch {
      toast.error('Error updating activity')
    } finally {
      setSavingEdit(false)
    }
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
    } else {
      toast.error('Failed to remove activity')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted text-sm font-medium">Loading Itinerary...</p>
        </div>
      </div>
    )
  }

  if (!trip) return null

  return (
    <div className="space-y-8 animate-in pb-20 max-w-5xl mx-auto">
      {/* 1. Top Header Bar (Matching Screen 5 wireframe) */}
      <div className="border-b border-border/80 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link
            href="/trips"
            className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-primary mb-2 transition-colors"
          >
            <ArrowLeft size={13} /> Back to My Trips
          </Link>
          <h1 className="font-heading font-black text-3xl text-text flex items-center gap-2.5">
            <Compass size={28} className="text-primary" />
            Build Itinerary Screen
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-text font-bold text-base">{trip.name}</p>
            <button
              onClick={() => setIsTripEditOpen(true)}
              className="text-xs text-primary hover:underline font-semibold flex items-center gap-1 cursor-pointer bg-primary/10 px-2 py-0.5 rounded-md"
            >
              <Edit2 size={12} /> Edit Dates & Info
            </button>
          </div>
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
            className="btn-secondary flex items-center gap-1.5 text-xs py-2 px-3.5 text-secondary font-bold"
          >
            <BarChart2 size={14} /> Budget ({formatCurrency(trip.totalBudget)})
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
              className="btn-primary inline-flex items-center gap-2 cursor-pointer"
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

                  {/* Actions: Edit, Reorder, Delete */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditStop(stop)}
                      className="p-1.5 hover:bg-surface2 text-primary rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
                      title="Edit Section Name & Dates"
                    >
                      <Edit2 size={15} />
                      <span className="hidden sm:inline">Edit Section</span>
                    </button>
                    <button
                      onClick={() => handleMoveStop(stop, 'up')}
                      disabled={idx === 0}
                      className="p-1.5 hover:bg-surface2 rounded-lg disabled:opacity-20 transition-colors text-muted hover:text-text cursor-pointer"
                      title="Move Up"
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      onClick={() => handleMoveStop(stop, 'down')}
                      disabled={idx === trip.stops.length - 1}
                      className="p-1.5 hover:bg-surface2 rounded-lg disabled:opacity-20 transition-colors text-muted hover:text-text cursor-pointer"
                      title="Move Down"
                    >
                      <ChevronDown size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteStop(stop.id)}
                      className="p-1.5 hover:bg-danger/10 text-danger rounded-lg transition-colors ml-1 cursor-pointer"
                      title="Delete Section"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Section Description */}
                <p className="text-muted text-xs leading-relaxed">
                  All the necessary information about this section. This can be anything like travel
                  section, hotel, tours, dining, or any other activity for {stop.cityName}.
                </p>

                {/* Date Range & Budget Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div
                    onClick={() => handleOpenEditStop(stop)}
                    className="p-3.5 bg-surface2/60 rounded-xl border border-border/60 flex items-center gap-3 cursor-pointer hover:border-primary/50 transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <span className="text-muted text-[11px] block uppercase font-bold tracking-wider">
                        Date Range (Click to Edit):
                      </span>
                      <p className="font-heading font-semibold text-xs text-text mt-0.5 group-hover:text-primary transition-colors">
                        {dateRangeStr}
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-surface2/60 rounded-xl border border-border/60 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary">
                        <DollarSign size={18} />
                      </div>
                      <div>
                        <span className="text-muted text-[11px] block uppercase font-bold tracking-wider">
                          Budget of this section:
                        </span>
                        <p className="font-heading font-black text-base text-secondary mt-0.5">
                          {formatCurrency(sectionBudget)}
                        </p>
                      </div>
                    </div>
                    <span className="badge bg-surface text-muted text-[11px] font-semibold border border-border">
                      {stop.activities.length} items
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
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                            <button
                              onClick={() => handleOpenEditActivity(act)}
                              className="p-1 hover:bg-surface text-primary rounded-lg transition-all cursor-pointer"
                              title="Edit Activity"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteActivity(act.id)}
                              className="p-1 hover:bg-danger/10 text-danger rounded-lg transition-all cursor-pointer"
                              title="Remove item"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Add activity to section */}
                <div className="pt-2 flex justify-start">
                  <button
                    onClick={() => setActModalOpen(stop.id)}
                    className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5 font-medium cursor-pointer"
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

      {/* Edit Section / Stop Modal */}
      {editingStop && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card max-w-md w-full p-6 space-y-4 border border-border shadow-2xl animate-in">
            <div className="flex items-center justify-between border-b border-border/70 pb-3">
              <h3 className="font-heading font-bold text-lg text-text flex items-center gap-2">
                <Edit2 size={18} className="text-primary" />
                Edit Section Details
              </h3>
              <button
                onClick={() => setEditingStop(null)}
                className="p-1 hover:bg-surface2 rounded-lg text-muted hover:text-text cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveStop} className="space-y-3.5">
              <div>
                <label className="label-base text-xs font-semibold">City / Location Name:</label>
                <input
                  type="text"
                  required
                  value={stopForm.cityName}
                  onChange={(e) => setStopForm((p) => ({ ...p, cityName: e.target.value }))}
                  className="input-base !py-2 text-xs"
                />
              </div>

              <div>
                <label className="label-base text-xs font-semibold">Country:</label>
                <input
                  type="text"
                  value={stopForm.country}
                  onChange={(e) => setStopForm((p) => ({ ...p, country: e.target.value }))}
                  className="input-base !py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-base text-xs font-semibold">Arrival Date:</label>
                  <input
                    type="date"
                    value={stopForm.arrivalDate}
                    onChange={(e) => setStopForm((p) => ({ ...p, arrivalDate: e.target.value }))}
                    className="input-base !py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="label-base text-xs font-semibold">Departure Date:</label>
                  <input
                    type="date"
                    value={stopForm.departureDate}
                    onChange={(e) => setStopForm((p) => ({ ...p, departureDate: e.target.value }))}
                    className="input-base !py-2 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingStop(null)}
                  className="btn-secondary text-xs !py-2 !px-3.5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="btn-primary text-xs !py-2 !px-4 font-bold flex items-center gap-1.5"
                >
                  {savingEdit ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                  Save Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Activity Modal */}
      {editingActivity && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card max-w-md w-full p-6 space-y-4 border border-border shadow-2xl animate-in">
            <div className="flex items-center justify-between border-b border-border/70 pb-3">
              <h3 className="font-heading font-bold text-lg text-text flex items-center gap-2">
                <Edit2 size={18} className="text-primary" />
                Edit Activity Item
              </h3>
              <button
                onClick={() => setEditingActivity(null)}
                className="p-1 hover:bg-surface2 rounded-lg text-muted hover:text-text cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveActivity} className="space-y-3.5">
              <div>
                <label className="label-base text-xs font-semibold">Activity Name / Attraction:</label>
                <input
                  type="text"
                  required
                  value={actForm.name}
                  onChange={(e) => setActForm((p) => ({ ...p, name: e.target.value }))}
                  className="input-base !py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-base text-xs font-semibold">Category:</label>
                  <select
                    value={actForm.category}
                    onChange={(e) => setActForm((p) => ({ ...p, category: e.target.value }))}
                    className="input-base !py-2 text-xs cursor-pointer"
                  >
                    <option value="sightseeing">🏛️ Sightseeing</option>
                    <option value="food">🍜 Food & Dining</option>
                    <option value="adventure">🏄 Adventure</option>
                    <option value="stay">🏨 Accommodation</option>
                    <option value="transport">🚆 Transport</option>
                    <option value="other">✨ Other</option>
                  </select>
                </div>

                <div>
                  <label className="label-base text-xs font-semibold">Cost ($ USD):</label>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={actForm.cost}
                    onChange={(e) => setActForm((p) => ({ ...p, cost: parseFloat(e.target.value) || 0 }))}
                    className="input-base !py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-base text-xs font-semibold">Scheduled Time:</label>
                  <input
                    type="text"
                    value={actForm.scheduledTime}
                    onChange={(e) => setActForm((p) => ({ ...p, scheduledTime: e.target.value }))}
                    placeholder="e.g. 10:00 AM"
                    className="input-base !py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="label-base text-xs font-semibold">Day Number:</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={actForm.dayNumber}
                    onChange={(e) => setActForm((p) => ({ ...p, dayNumber: parseInt(e.target.value) || 1 }))}
                    className="input-base !py-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="label-base text-xs font-semibold">Notes / Description:</label>
                <textarea
                  rows={2}
                  value={actForm.description}
                  onChange={(e) => setActForm((p) => ({ ...p, description: e.target.value }))}
                  className="input-base !py-2 text-xs resize-none"
                  placeholder="Optional notes or address..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingActivity(null)}
                  className="btn-secondary text-xs !py-2 !px-3.5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="btn-primary text-xs !py-2 !px-4 font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  {savingEdit ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                  Save Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Trip Details Modal */}
      {isTripEditOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card max-w-md w-full p-6 space-y-4 border border-border shadow-2xl animate-in">
            <div className="flex items-center justify-between border-b border-border/70 pb-3">
              <h3 className="font-heading font-bold text-lg text-text flex items-center gap-2">
                <Sparkles size={18} className="text-primary" />
                Edit Trip Details & Dates
              </h3>
              <button
                onClick={() => setIsTripEditOpen(false)}
                className="p-1 hover:bg-surface2 rounded-lg text-muted hover:text-text cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveTrip} className="space-y-3.5">
              <div>
                <label className="label-base text-xs font-semibold">Trip Title:</label>
                <input
                  type="text"
                  required
                  value={tripForm.name}
                  onChange={(e) => setTripForm((p) => ({ ...p, name: e.target.value }))}
                  className="input-base !py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-base text-xs font-semibold">Start Date:</label>
                  <input
                    type="date"
                    value={tripForm.startDate}
                    onChange={(e) => setTripForm((p) => ({ ...p, startDate: e.target.value }))}
                    className="input-base !py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="label-base text-xs font-semibold">End Date:</label>
                  <input
                    type="date"
                    value={tripForm.endDate}
                    onChange={(e) => setTripForm((p) => ({ ...p, endDate: e.target.value }))}
                    className="input-base !py-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="label-base text-xs font-semibold">Total Estimated Budget ($ USD):</label>
                <input
                  type="number"
                  min="0"
                  value={tripForm.totalBudget}
                  onChange={(e) => setTripForm((p) => ({ ...p, totalBudget: parseFloat(e.target.value) || 0 }))}
                  className="input-base !py-2 text-xs"
                />
              </div>

              <div>
                <label className="label-base text-xs font-semibold">Trip Description:</label>
                <textarea
                  rows={2}
                  value={tripForm.description}
                  onChange={(e) => setTripForm((p) => ({ ...p, description: e.target.value }))}
                  className="input-base !py-2 text-xs resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsTripEditOpen(false)}
                  className="btn-secondary text-xs !py-2 !px-3.5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="btn-primary text-xs !py-2 !px-4 font-bold flex items-center gap-1.5"
                >
                  {savingEdit ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                  Save Trip Info
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search Modals */}
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
