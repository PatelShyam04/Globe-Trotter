'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Globe, Calendar, FileText, Image as ImageIcon, Lock, Loader2, ArrowLeft, DollarSign, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function CreateTripPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    coverPhoto: '',
    isPublic: false,
    totalBudget: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error('Trip name is required')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          totalBudget: form.totalBudget ? parseFloat(form.totalBudget) : 0,
        }),
      })
      const trip = await res.json()
      if (!res.ok) throw new Error(trip.error)
      toast.success('Trip created! Now add your cities.')
      router.push(`/trips/${trip.id}/itinerary`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to create trip')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto animate-in">
      <div className="mb-8">
        <Link href="/trips" className="flex items-center gap-2 text-muted hover:text-text transition-colors text-sm mb-4">
          <ArrowLeft size={16} />
          Back to My Trips
        </Link>
        <h1 className="font-heading font-bold text-3xl">Create New Trip</h1>
        <p className="text-muted mt-1">Fill in the details to start planning your next journey</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        {/* Trip Name */}
        <div>
          <label htmlFor="trip-name" className="label-base">
            <Globe size={14} className="inline mr-1 text-primary" /> Trip Name *
          </label>
          <input
            id="trip-name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Europe Summer 2026"
            className="input-base"
            autoFocus
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="start-date" className="label-base">
              <Calendar size={14} className="inline mr-1 text-primary" /> Start Date
            </label>
            <input
              id="start-date"
              name="startDate"
              type="date"
              value={form.startDate}
              onChange={handleChange}
              className="input-base"
            />
          </div>
          <div>
            <label htmlFor="end-date" className="label-base">
              <Calendar size={14} className="inline mr-1 text-primary" /> End Date
            </label>
            <input
              id="end-date"
              name="endDate"
              type="date"
              value={form.endDate}
              onChange={handleChange}
              className="input-base"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="trip-description" className="label-base">
            <FileText size={14} className="inline mr-1 text-primary" /> Description
          </label>
          <textarea
            id="trip-description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="What's the vibe and purpose of this trip?"
            rows={3}
            className="input-base resize-none"
          />
        </div>

        {/* Budget */}
        <div>
          <label htmlFor="budget" className="label-base">
            <DollarSign size={14} className="inline mr-1 text-secondary" /> Estimated Budget (USD)
          </label>
          <input
            id="budget"
            name="totalBudget"
            type="number"
            min="0"
            value={form.totalBudget}
            onChange={handleChange}
            placeholder="e.g. 3000"
            className="input-base"
          />
        </div>

        {/* Cover photo */}
        <div>
          <label htmlFor="cover-photo" className="label-base">
            <ImageIcon size={14} className="inline mr-1 text-primary" /> Cover Photo URL (optional)
          </label>
          <input
            id="cover-photo"
            name="coverPhoto"
            type="url"
            value={form.coverPhoto}
            onChange={handleChange}
            placeholder="https://images.unsplash.com/photo-..."
            className="input-base"
          />
        </div>

        {/* Public toggle */}
        <div className="flex items-center gap-3 p-4 bg-surface2 rounded-xl border border-border">
          <input
            id="is-public"
            name="isPublic"
            type="checkbox"
            checked={form.isPublic}
            onChange={handleChange}
            className="w-5 h-5 rounded accent-primary cursor-pointer"
          />
          <div>
            <label htmlFor="is-public" className="font-semibold cursor-pointer flex items-center gap-1.5 text-sm text-text">
              <Lock size={14} className="text-primary" />
              Make trip publicly shareable
            </label>
            <p className="text-muted text-xs mt-0.5">
              Anyone with the link will be able to view and get inspired by your itinerary
            </p>
          </div>
        </div>

        <div className="flex gap-4 pt-2">
          <Link href="/trips" className="btn-secondary flex-1 text-center py-3">
            Cancel
          </Link>
          <button
            id="save-trip-btn"
            type="submit"
            disabled={loading}
            className="btn-primary flex-1 flex items-center justify-center gap-2 py-3"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                <Sparkles size={16} />
                Create Trip & Add Cities
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
