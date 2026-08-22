'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Globe, Mail, Lock, User, Eye, EyeOff, ArrowRight, Loader2, Compass, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !password) {
      toast.error('Please fill in all fields')
      return
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Registration failed')
        return
      }
      const signInRes = await signIn('credentials', { email, password, redirect: false })
      if (signInRes?.error) {
        toast.error('Account created! Please sign in.')
        router.push('/login')
      } else {
        toast.success('Welcome to GlobeTrotter! 🌍')
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
    <div className="min-h-screen bg-bg flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-secondary/15 via-surface to-bg items-center justify-center relative overflow-hidden p-12 border-r border-border/40">
        <div className="absolute inset-0 bg-hero-pattern opacity-30" />
        <div className="absolute top-20 right-20 w-72 h-72 bg-secondary/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 left-20 w-60 h-60 bg-primary/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center max-w-lg">
          <div className="inline-flex p-4 rounded-2xl bg-secondary/10 border border-secondary/20 mb-6 shadow-lg shadow-secondary/10">
            <span className="text-4xl">✈️</span>
          </div>

          <h1 className="font-heading font-black text-4xl mb-4 tracking-tight">
            Join <span className="gradient-text">GlobeTrotter</span>
          </h1>
          <p className="text-muted text-base leading-relaxed mb-8">
            Create an account to build personalized itineraries, track trip budgets, and explore the globe.
          </p>

          <div className="space-y-3 text-left">
            {[
              'Create unlimited custom trips & stops',
              'Auto-calculated budgets with visual charts',
              'Discover 30+ curated global destinations',
              'Share beautiful public itineraries with friends',
            ].map((f) => (
              <div key={f} className="glass px-4 py-3 rounded-xl text-sm text-text flex items-center gap-3 shadow-sm">
                <CheckCircle2 size={18} className="text-primary flex-shrink-0" />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md animate-in">
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Compass size={22} />
            </div>
            <span className="font-heading font-bold text-xl tracking-tight">GlobeTrotter</span>
          </div>

          <h2 className="font-heading font-bold text-3xl mb-1.5 text-text">Create your account</h2>
          <p className="text-muted text-sm mb-8">Start planning your next adventure for free</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="label-base">Full Name</label>
              <div className="relative group">
                <User
                  size={18}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors"
                />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="input-base input-icon-left"
                  autoComplete="name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="label-base">Email address</label>
              <div className="relative group">
                <Mail
                  size={18}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors"
                />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-base input-icon-left"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="label-base">Password</label>
              <div className="relative group">
                <Lock
                  size={18}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors"
                />
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="input-base input-icon-left input-icon-right"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-text rounded-md transition-colors"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              id="signup-btn"
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 mt-2"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-muted text-sm mt-8">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
