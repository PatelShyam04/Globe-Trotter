'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatCurrency, formatDate, getCountryFlag } from '@/lib/helpers'
import { Calendar, MapPin, Trash2, Eye, Edit2, Share2, Camera, X, Check, Loader2, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { CURATED_COVER_PRESETS, getDestinationPhoto } from '@/lib/photos'

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

export default function TripCard({ trip }: { trip: Trip }) {
  const router = useRouter()
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false)
  const [currentCover, setCurrentCover] = useState<string>(
    trip.coverPhoto || getDestinationPhoto(trip.name || trip.stops[0]?.cityName)
  )
  const [savingPhoto, setSavingPhoto] = useState(false)
  const [customUrl, setCustomUrl] = useState('')

  const totalCost = trip.stops.flatMap((s) => s.activities).reduce((sum, a) => sum + a.cost, 0)
  const cities = trip.stops.map((s) => getCountryFlag(s.country || '') + ' ' + s.cityName).join(' → ')

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    const res = await fetch(`/api/trips/${trip.id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success(`"${trip.name}" deleted`)
      router.refresh()
    } else {
      toast.error('Failed to delete trip')
    }
  }

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!trip.isPublic) {
      toast.error('Enable public sharing in trip settings first')
      return
    }
    const url = `${window.location.origin}/itinerary/${trip.id}`
    navigator.clipboard.writeText(url)
    toast.success('Link copied to clipboard!')
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        const dataUrl = reader.result as string
        handleSaveCover(dataUrl)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveCover = async (photoUrl: string) => {
    setSavingPhoto(true)
    try {
      const res = await fetch(`/api/trips/${trip.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coverPhoto: photoUrl }),
      })
      if (res.ok) {
        setCurrentCover(photoUrl)
        toast.success('Trip cover photo updated!')
        setIsPhotoModalOpen(false)
        router.refresh()
      } else {
        toast.error('Failed to update cover photo')
      }
    } catch {
      toast.error('Error saving photo')
    } finally {
      setSavingPhoto(false)
    }
  }

  return (
    <div className="trip-card group">
      {/* Cover */}
      <div
        className="h-44 bg-gradient-to-br from-primary/20 to-surface2 relative overflow-hidden transition-transform duration-500"
        style={{
          backgroundImage: `url(${currentCover})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-black/20 to-transparent" />

        {/* Change Cover Photo Button */}
        <button
          onClick={(e) => {
            e.preventDefault()
            setIsPhotoModalOpen(true)
          }}
          className="absolute top-3 left-3 p-2 rounded-xl bg-surface/85 hover:bg-surface text-text hover:text-primary backdrop-blur-md border border-border/80 shadow-md transition-all duration-200 cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
          title="Change Trip Photo"
        >
          <Camera size={14} />
          <span className="hidden sm:inline text-[11px]">Change Photo</span>
        </button>

        {trip.isPublic && (
          <span className="absolute top-3 right-3 badge bg-primary/20 text-primary border border-primary/30 backdrop-blur-sm">
            Public
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-heading font-bold text-lg truncate mb-1 text-text group-hover:text-primary transition-colors">
          {trip.name}
        </h3>
        {cities && <p className="text-muted text-xs truncate mb-2">{cities || 'No cities added'}</p>}

        <div className="flex items-center gap-1 text-muted text-xs mb-3">
          <Calendar size={12} className="text-primary" />
          {trip.startDate ? formatDate(trip.startDate) : 'No date'} –{' '}
          {trip.endDate ? formatDate(trip.endDate) : 'TBD'}
        </div>

        <div className="flex items-center justify-between mb-4">
          <span className="flex items-center gap-1 text-xs text-muted">
            <MapPin size={12} className="text-primary" /> {trip.stops.length}{' '}
            {trip.stops.length === 1 ? 'city' : 'cities'}
          </span>
          <span className="text-secondary font-bold">{formatCurrency(totalCost)}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            href={`/trips/${trip.id}/itinerary`}
            id={`view-trip-${trip.id}`}
            className="btn-secondary flex-1 flex items-center justify-center gap-1 py-2 text-xs font-semibold"
          >
            <Eye size={13} />
            View
          </Link>
          <Link
            href={`/trips/${trip.id}/budget`}
            className="btn-secondary flex items-center justify-center gap-1 py-2 px-3 text-xs"
            title="Budget Breakdown"
          >
            <Edit2 size={13} />
          </Link>
          <button
            onClick={handleShare}
            className="btn-secondary flex items-center justify-center gap-1 py-2 px-3 text-xs"
            title="Share Itinerary"
          >
            <Share2 size={13} />
          </button>
          <button
            id={`delete-trip-${trip.id}`}
            onClick={handleDelete}
            className="btn-danger flex items-center justify-center py-2 px-3 text-xs"
            title="Delete Trip"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Photo Picker Modal */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card max-w-lg w-full p-6 space-y-5 border border-border shadow-2xl animate-in">
            <div className="flex items-center justify-between border-b border-border/70 pb-3">
              <h3 className="font-heading font-bold text-lg text-text flex items-center gap-2">
                <Camera size={18} className="text-primary" />
                Change Cover Photo for &quot;{trip.name}&quot;
              </h3>
              <button
                onClick={() => setIsPhotoModalOpen(false)}
                className="p-1.5 hover:bg-surface2 rounded-lg text-muted hover:text-text transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* 1. Device File Upload */}
            <div className="p-4 rounded-2xl bg-surface2/60 border border-border/80 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-text">Upload from your Device</h4>
                <p className="text-xs text-muted">Upload any JPG, PNG or WebP image file</p>
              </div>
              <label
                htmlFor={`trip-file-${trip.id}`}
                className="btn-primary text-xs py-2 px-3 flex items-center gap-1.5 cursor-pointer font-semibold"
              >
                {savingPhoto ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
                Choose File
              </label>
              <input
                id={`trip-file-${trip.id}`}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={savingPhoto}
              />
            </div>

            {/* 2. Curated Presets */}
            <div>
              <span className="text-xs font-semibold text-text block mb-2">Or choose a curated travel photo:</span>
              <div className="grid grid-cols-3 gap-2.5 max-h-48 overflow-y-auto pr-1">
                {CURATED_COVER_PRESETS.map((preset) => (
                  <div
                    key={preset.name}
                    onClick={() => handleSaveCover(preset.url)}
                    className="relative h-20 rounded-xl overflow-hidden cursor-pointer border border-border hover:border-primary group transition-all"
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />
                    <span className="absolute bottom-1 left-1.5 right-1.5 text-[10px] font-bold text-white truncate drop-shadow-md">
                      {preset.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Custom URL */}
            <div className="space-y-2">
              <label htmlFor="custom-photo-url" className="text-xs font-semibold text-text">Or paste custom image URL:</label>
              <div className="flex gap-2">
                <input
                  id="custom-photo-url"
                  type="text"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="input-base !py-1.5 text-xs flex-1"
                />
                <button
                  onClick={() => customUrl.trim() && handleSaveCover(customUrl.trim())}
                  disabled={!customUrl.trim() || savingPhoto}
                  className="btn-primary text-xs !py-1.5 !px-3 font-semibold disabled:opacity-50"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
