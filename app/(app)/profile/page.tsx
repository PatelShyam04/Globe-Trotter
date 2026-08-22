'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { User, Mail, Image as ImageIcon, Save, Trash2, Loader2, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [form, setForm] = useState({
    name: session?.user?.name || '',
    image: session?.user?.image || '',
    currentPassword: '',
    newPassword: '',
  })

  useEffect(() => {
    if (session?.user) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || session.user?.name || '',
        image: prev.image || session.user?.image || '',
      }))
    }
  }, [session])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      await update({ name: data.name, image: data.image })
      toast.success('Profile updated!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to update')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure? This will permanently delete your account and all trips.')) return
    setDeleteLoading(true)
    const res = await fetch('/api/profile', { method: 'DELETE' })
    if (res.ok) {
      signOut({ callbackUrl: '/' })
    } else {
      toast.error('Failed to delete account')
      setDeleteLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto animate-in">
      <div className="mb-8">
        <h1 className="font-heading font-bold text-3xl">Profile & Settings</h1>
        <p className="text-muted mt-1">Manage your account details and preferences</p>
      </div>

      {/* Avatar preview */}
      <div className="card mb-6 flex items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-3xl font-bold text-primary overflow-hidden border border-primary/30">
          {form.image ? (
            <img src={form.image} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            session?.user?.name?.charAt(0)?.toUpperCase() || 'U'
          )}
        </div>
        <div>
          <p className="font-heading font-bold text-xl">{session?.user?.name || 'Explorer'}</p>
          <p className="text-muted text-sm">{session?.user?.email}</p>
          <div className="flex items-center gap-1.5 mt-1.5 text-primary text-xs font-semibold">
            <Shield size={13} /> Active Traveler
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="card space-y-5 mb-6">
        <h2 className="font-heading font-semibold text-lg border-b border-border pb-3">
          Personal Information
        </h2>

        <div>
          <label htmlFor="profile-name" className="label-base">
            <User size={14} className="inline mr-1 text-primary" /> Display Name
          </label>
          <input
            id="profile-name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            placeholder="Your name"
            className="input-base"
          />
        </div>

        <div>
          <label className="label-base">
            <Mail size={14} className="inline mr-1 text-primary" /> Email address (read-only)
          </label>
          <input
            type="email"
            value={session?.user?.email || ''}
            disabled
            className="input-base opacity-50 cursor-not-allowed bg-surface"
          />
        </div>

        <div>
          <label htmlFor="profile-image" className="label-base">
            <ImageIcon size={14} className="inline mr-1 text-primary" /> Profile Photo URL
          </label>
          <input
            id="profile-image"
            name="image"
            type="url"
            value={form.image}
            onChange={handleChange}
            placeholder="https://images.unsplash.com/..."
            className="input-base"
          />
        </div>

        <div className="border-t border-border pt-4">
          <h3 className="font-semibold text-sm mb-3 text-muted">Change Password (optional)</h3>
          <div className="space-y-3">
            <input
              id="current-password"
              name="currentPassword"
              type="password"
              value={form.currentPassword}
              onChange={handleChange}
              placeholder="Current password"
              className="input-base"
            />
            <input
              id="new-password"
              name="newPassword"
              type="password"
              value={form.newPassword}
              onChange={handleChange}
              placeholder="New password (min 6 chars)"
              className="input-base"
            />
          </div>
        </div>

        <button
          id="save-profile-btn"
          type="submit"
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2 py-3"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <><Save size={16} /> Save Changes</>}
        </button>
      </form>

      {/* Danger zone */}
      <div className="card border-danger/30 bg-danger/5">
        <h2 className="font-heading font-semibold text-lg text-danger mb-2">⚠️ Danger Zone</h2>
        <p className="text-muted text-sm mb-4">
          Permanently delete your account and all associated trips, stops, and activities. This cannot be undone.
        </p>
        <button
          id="delete-account-btn"
          onClick={handleDelete}
          disabled={deleteLoading}
          className="btn-danger flex items-center gap-2"
        >
          {deleteLoading ? <Loader2 size={16} className="animate-spin" /> : <><Trash2 size={16} /> Delete Account</>}
        </button>
      </div>
    </div>
  )
}
