'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Camera,
  Edit2,
  Save,
  Trash2,
  Calendar,
  Eye,
  Loader2,
  Shield,
  FileText,
  Sparkles,
  Plane,
} from 'lucide-react'
import { formatCurrency, formatDate, getCountryFlag } from '@/lib/helpers'
import toast from 'react-hot-toast'
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface UserData {
  id: string
  name?: string | null
  firstName?: string | null
  lastName?: string | null
  email: string
  phone?: string | null
  city?: string | null
  country?: string | null
  bio?: string | null
  image?: string | null
  createdAt: Date | string
}

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
  startDate?: Date | string | null
  endDate?: Date | string | null
  coverPhoto?: string | null
  isPublic: boolean
  totalBudget: number
  stops: Stop[]
  createdAt: Date | string
}

interface Props {
  user: UserData
  trips: Trip[]
}

export default function ProfileClient({ user: initialUser, trips }: Props) {
  const router = useRouter()
  const { update } = useSession()
  const [user, setUser] = useState(initialUser)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    name: user?.name || '',
    phone: user?.phone || '',
    city: user?.city || '',
    country: user?.country || '',
    bio: user?.bio || '',
    image: user?.image || '',
  })

  const now = new Date()

  // Preplanned (Upcoming) vs Previous (Completed) Trips
  const preplannedTrips = trips.filter((t) => !t.endDate || new Date(t.endDate) >= now)
  const previousTrips = trips.filter((t) => t.endDate && new Date(t.endDate) < now)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const fullName = [form.firstName, form.lastName].filter(Boolean).join(' ') || form.name || 'Traveler'
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          name: fullName,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setUser((prev) => ({ ...prev, ...form, name: fullName }))
      await update({ name: fullName, image: form.image })
      toast.success('Profile updated successfully!')
      setIsEditing(false)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const renderTripBox = (trip: Trip) => {
    const totalCost = trip.stops
      .flatMap((s) => s.activities)
      .reduce((sum, a) => sum + a.cost, 0)
    const citiesCount = trip.stops.length

    return (
      <div
        key={trip.id}
        className="card !p-5 border border-border hover:border-primary/50 transition-all shadow-lg flex flex-col justify-between group"
      >
        <div className="space-y-2">
          {/* Cover or placeholder */}
          <div
            className="h-32 rounded-xl bg-gradient-to-br from-primary/20 to-surface2 relative overflow-hidden flex items-center justify-center mb-3"
            style={
              trip.coverPhoto
                ? { backgroundImage: `url(${trip.coverPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                : {}
            }
          >
            {!trip.coverPhoto && <span className="text-4xl">🌍</span>}
            <div className="absolute inset-0 bg-gradient-to-t from-surface/80 to-transparent" />
            <span className="absolute bottom-2 left-2 badge bg-surface/90 text-text text-xs border border-border">
              {citiesCount} {citiesCount === 1 ? 'city' : 'cities'}
            </span>
          </div>

          <h3 className="font-heading font-bold text-base text-text truncate group-hover:text-primary transition-colors">
            {trip.name}
          </h3>

          <p className="text-muted text-xs flex items-center gap-1.5">
            <Calendar size={12} className="text-primary" />
            {trip.startDate ? formatDate(trip.startDate) : 'Dates TBD'}
          </p>

          <p className="text-secondary text-xs font-semibold">
            Cost: {formatCurrency(totalCost)}
          </p>
        </div>

        <div className="pt-4 mt-2 border-t border-border/50">
          <Link
            href={`/trips/${trip.id}/itinerary`}
            className="btn-primary w-full py-2 text-xs flex items-center justify-center gap-1 font-semibold"
          >
            <Eye size={13} />
            View
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-10 animate-in max-w-5xl mx-auto pb-16">
      {/* Screen Title */}
      <div className="border-b border-border/80 pb-4 flex items-center justify-between">
        <div>
          <h1 className="font-heading font-black text-3xl text-text">User Profile Pages</h1>
          <p className="text-muted text-sm mt-0.5">Manage your personal traveler details and history</p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5 font-semibold"
        >
          <Edit2 size={13} />
          {isEditing ? 'Cancel Edit' : 'Edit Details'}
        </button>
      </div>

      {/* 1. Top Section: User Details with Image (Matching Screen 7 wireframe) */}
      <div className="card !p-6 md:!p-8 border border-border shadow-2xl flex flex-col md:flex-row items-center md:items-start gap-8">
        {/* Left: Circular Image of the User */}
        <div className="flex flex-col items-center flex-shrink-0">
          <div className="w-32 h-32 md:w-36 md:h-36 rounded-full bg-gradient-to-tr from-primary/30 to-secondary/30 border-3 border-primary/50 flex items-center justify-center text-4xl font-bold text-primary overflow-hidden shadow-xl shadow-primary/10 relative group">
            {form.image || user?.image ? (
              <img
                src={form.image || user?.image!}
                alt={user?.name || 'User'}
                className="w-full h-full object-cover"
              />
            ) : (
              user?.name?.charAt(0)?.toUpperCase() || 'U'
            )}
          </div>
          <span className="badge bg-primary/15 text-primary text-xs font-semibold mt-3 flex items-center gap-1">
            <Shield size={12} /> Verified Traveler
          </span>
        </div>

        {/* Right: User Details Box */}
        <div className="flex-1 w-full space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <h2 className="font-heading font-bold text-xl text-text">
              User Details with appropriate option to edit those information....
            </h2>
          </div>

          {!isEditing ? (
            /* View Mode */
            <div className="space-y-4 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-surface2/60 p-3.5 rounded-xl border border-border/50">
                  <span className="text-muted text-xs block font-semibold uppercase tracking-wider">
                    Full Name
                  </span>
                  <p className="text-base font-bold text-text mt-0.5">{user?.name || 'Traveler'}</p>
                </div>

                <div className="bg-surface2/60 p-3.5 rounded-xl border border-border/50">
                  <span className="text-muted text-xs block font-semibold uppercase tracking-wider">
                    Email Address
                  </span>
                  <p className="text-base font-bold text-text mt-0.5">{user?.email}</p>
                </div>

                <div className="bg-surface2/60 p-3.5 rounded-xl border border-border/50">
                  <span className="text-muted text-xs block font-semibold uppercase tracking-wider">
                    Phone Number
                  </span>
                  <p className="text-base font-bold text-text mt-0.5">{user?.phone || 'Not set'}</p>
                </div>

                <div className="bg-surface2/60 p-3.5 rounded-xl border border-border/50">
                  <span className="text-muted text-xs block font-semibold uppercase tracking-wider">
                    Location
                  </span>
                  <p className="text-base font-bold text-text mt-0.5">
                    {[user?.city, user?.country].filter(Boolean).join(', ') || 'Not set'}
                  </p>
                </div>
              </div>

              {user?.bio && (
                <div className="bg-surface2/60 p-3.5 rounded-xl border border-border/50">
                  <span className="text-muted text-xs block font-semibold uppercase tracking-wider">
                    Additional Information / Bio
                  </span>
                  <p className="text-sm text-text mt-1 leading-relaxed">{user.bio}</p>
                </div>
              )}
            </div>
          ) : (
            /* Edit Mode Form */
            <form onSubmit={handleSave} className="space-y-4 pt-1 animate-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label htmlFor="edit-firstName" className="label-base text-xs">First Name</label>
                  <input
                    id="edit-firstName"
                    name="firstName"
                    type="text"
                    value={form.firstName}
                    onChange={handleChange}
                    className="input-base !py-2 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="edit-lastName" className="label-base text-xs">Last Name</label>
                  <input
                    id="edit-lastName"
                    name="lastName"
                    type="text"
                    value={form.lastName}
                    onChange={handleChange}
                    className="input-base !py-2 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="edit-phone" className="label-base text-xs">Phone Number</label>
                  <input
                    id="edit-phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 000-0000"
                    className="input-base !py-2 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="edit-image" className="label-base text-xs">Photo URL</label>
                  <input
                    id="edit-image"
                    name="image"
                    type="url"
                    value={form.image}
                    onChange={handleChange}
                    placeholder="https://..."
                    className="input-base !py-2 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="edit-city" className="label-base text-xs">City</label>
                  <input
                    id="edit-city"
                    name="city"
                    type="text"
                    value={form.city}
                    onChange={handleChange}
                    className="input-base !py-2 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="edit-country" className="label-base text-xs">Country</label>
                  <input
                    id="edit-country"
                    name="country"
                    type="text"
                    value={form.country}
                    onChange={handleChange}
                    className="input-base !py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="edit-bio" className="label-base text-xs">Additional Information / Bio</label>
                <textarea
                  id="edit-bio"
                  name="bio"
                  rows={2}
                  value={form.bio}
                  onChange={handleChange}
                  className="input-base !py-2 text-sm resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn-secondary text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary text-xs py-2 px-5 flex items-center gap-1.5 font-semibold"
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : <><Save size={13} /> Save Changes</>}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* 2. Middle Section: Preplanned Trips (Screen 7 wireframe) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-border/70 pb-3">
          <h2 className="font-heading font-bold text-2xl text-text flex items-center gap-2">
            <Plane size={22} className="text-primary" />
            Preplanned Trips
          </h2>
          <span className="badge bg-primary/10 text-primary text-xs font-semibold">
            {preplannedTrips.length} upcoming
          </span>
        </div>

        {preplannedTrips.length === 0 ? (
          <div className="card !p-8 text-center text-muted text-sm border-dashed border-2">
            No preplanned trips yet.{' '}
            <Link href="/trips/create" className="text-primary font-semibold hover:underline">
              Plan your next trip now!
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {preplannedTrips.map((t) => renderTripBox(t))}
          </div>
        )}
      </section>

      {/* 3. Bottom Section: Previous Trips (Screen 7 wireframe) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-border/70 pb-3">
          <h2 className="font-heading font-bold text-2xl text-text flex items-center gap-2">
            <Calendar size={22} className="text-secondary" />
            Previous Trips
          </h2>
          <span className="badge bg-secondary/10 text-secondary text-xs font-semibold">
            {previousTrips.length} completed
          </span>
        </div>

        {previousTrips.length === 0 ? (
          <div className="card !p-8 text-center text-muted text-sm border-dashed border-2">
            No completed trips yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {previousTrips.map((t) => renderTripBox(t))}
          </div>
        )}
      </section>
    </div>
  )
}
