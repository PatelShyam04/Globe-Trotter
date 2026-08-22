'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Globe,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  Camera,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  FileText,
  Sparkles,
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    country: '',
    password: '',
    confirmPassword: '',
    bio: '',
    image: '',
  })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [avatarIndex, setAvatarIndex] = useState(0)

  const AVATARS = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleAvatarSelect = (url: string, index: number) => {
    setForm((prev) => ({ ...prev, image: url }))
    setAvatarIndex(index)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.firstName.trim()) {
      toast.error('Please enter your first name')
      return
    }
    if (!form.email.trim()) {
      toast.error('Please enter your email address')
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(form.email.trim())) {
      toast.error('Please enter a valid email address (e.g. name@example.com)')
      return
    }
    if (!form.password) {
      toast.error('Please create a password')
      return
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }
    if (form.confirmPassword && form.password !== form.confirmPassword) {
      toast.error('Passwords do not match. Please re-type your password.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          name: `${form.firstName} ${form.lastName}`.trim(),
          email: form.email,
          phone: form.phone,
          city: form.city,
          country: form.country,
          password: form.password,
          bio: form.bio,
          image: form.image || AVATARS[avatarIndex],
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Registration failed')
        return
      }

      const signInRes = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      })

      if (signInRes?.error) {
        toast.error('Account registered! Please sign in.')
        router.push('/login')
      } else {
        toast.success('Registration successful! Welcome to GlobeTrotter 🌍')
        router.push('/dashboard')
        router.refresh()
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg py-12 px-4 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background glow effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-2xl relative z-10 animate-in">
        {/* Screen Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Globe size={20} />
            </div>
            <span className="font-heading font-bold text-xl tracking-tight">GlobeTrotter</span>
          </Link>
          <h1 className="font-heading font-bold text-3xl text-text">Registration Screen</h1>
          <p className="text-muted text-sm mt-1">Create your traveler profile and start planning trips</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Top Circular Photo Avatar */}
          <div className="flex flex-col items-center justify-center mb-2">
            <div className="relative group cursor-pointer">
              <div className="w-24 h-24 rounded-full bg-surface2 border-2 border-primary/40 flex items-center justify-center overflow-hidden shadow-lg shadow-primary/10 group-hover:border-primary transition-all">
                {form.image || AVATARS[avatarIndex] ? (
                  <img
                    src={form.image || AVATARS[avatarIndex]}
                    alt="User photo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-muted">
                    <Camera size={24} />
                    <span className="text-xs font-semibold mt-1">Photo</span>
                  </div>
                )}
              </div>
              <label
                htmlFor="photo-url"
                className="absolute bottom-0 right-0 p-1.5 rounded-full bg-primary text-bg shadow-md cursor-pointer hover:bg-primary-dark transition-colors"
                title="Select / Paste photo"
              >
                <Camera size={14} />
              </label>
            </div>

            {/* Quick Avatar Pickers */}
            <div className="flex items-center gap-2 mt-3">
              <span className="text-xs text-muted mr-1">Choose Avatar:</span>
              {AVATARS.map((url, i) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => handleAvatarSelect(url, i)}
                  className={`w-7 h-7 rounded-full overflow-hidden border-2 transition-all ${
                    (form.image === url || (!form.image && avatarIndex === i))
                      ? 'border-primary scale-110 shadow-sm shadow-primary/40'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={url} alt={`Avatar ${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Main Card Container with Registration Fields */}
          <div className="card space-y-5 border border-border/80 shadow-2xl backdrop-blur-md">
            {/* Row 1: First Name & Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="label-base">First Name *</label>
                <div className="relative group">
                  <User size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" />
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={form.firstName}
                    onChange={handleChange}
                    placeholder="First Name"
                    className="input-base input-icon-left"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="lastName" className="label-base">Last Name</label>
                <div className="relative group">
                  <User size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" />
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={form.lastName}
                    onChange={handleChange}
                    placeholder="Last Name"
                    className="input-base input-icon-left"
                  />
                </div>
              </div>
            </div>

            {/* Row 2: Email Address & Phone Number */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="label-base">Email Address *</label>
                <div className="relative group">
                  <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Email Address"
                    className="input-base input-icon-left"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="label-base">Phone Number</label>
                <div className="relative group">
                  <Phone size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" />
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Phone Number"
                    className="input-base input-icon-left"
                  />
                </div>
              </div>
            </div>

            {/* Row 3: City & Country */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="label-base">City</label>
                <div className="relative group">
                  <MapPin size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" />
                  <input
                    id="city"
                    name="city"
                    type="text"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="City"
                    className="input-base input-icon-left"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="country" className="label-base">Country</label>
                <div className="relative group">
                  <Globe size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" />
                  <input
                    id="country"
                    name="country"
                    type="text"
                    value={form.country}
                    onChange={handleChange}
                    placeholder="Country"
                    className="input-base input-icon-left"
                  />
                </div>
              </div>
            </div>

            {/* Row 4: Password & Confirm Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="label-base">Password *</label>
                <div className="relative group">
                  <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" />
                  <input
                    id="password"
                    name="password"
                    type={showPw ? 'text' : 'password'}
                    required
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Password (min 6 chars)"
                    className="input-base input-icon-left input-icon-right"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-text rounded transition-colors"
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="label-base">Confirm Password</label>
                <div className="relative group">
                  <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPw ? 'text' : 'password'}
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm Password"
                    className="input-base input-icon-left"
                    autoComplete="new-password"
                  />
                </div>
              </div>
            </div>

            {/* Row 5: Additional Information */}
            <div>
              <label htmlFor="bio" className="label-base">
                <FileText size={14} className="inline mr-1 text-primary" /> Additional Information ....
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={3}
                value={form.bio}
                onChange={handleChange}
                placeholder="Share your travel interests, favorite travel styles, languages spoken..."
                className="input-base resize-none"
              />
            </div>
          </div>

          {/* Submit Button: Register Users */}
          <div className="flex flex-col items-center gap-4">
            <button
              id="register-users-btn"
              type="submit"
              disabled={loading}
              className="btn-primary w-full max-w-sm flex items-center justify-center gap-2 py-3.5 text-base font-semibold shadow-lg shadow-primary/20"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <Sparkles size={18} />
                  Register Users
                </>
              )}
            </button>

            <p className="text-center text-muted text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:underline font-semibold">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
