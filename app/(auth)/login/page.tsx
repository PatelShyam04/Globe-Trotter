'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Globe, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, Compass } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Please fill in all fields')
      return
    }
    setLoading(true)
    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })
      if (res?.error) {
        toast.error('Invalid email or password')
      } else {
        toast.success('Welcome back!')
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
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-primary/15 via-surface to-bg items-center justify-center relative overflow-hidden p-12 border-r border-border/40">
        <div className="absolute inset-0 bg-hero-pattern opacity-30" />
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 right-20 w-60 h-60 bg-secondary/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center max-w-lg">
          <div className="inline-flex p-4 rounded-2xl bg-primary/10 border border-primary/20 mb-6 shadow-lg shadow-primary/10">
            <Globe size={48} className="text-primary" />
          </div>

          <h1 className="font-heading font-black text-4xl mb-4 tracking-tight">
            Your Journey <br />
            <span className="gradient-text">Starts Here</span>
          </h1>

          <p className="text-muted text-base leading-relaxed mb-8">
            Plan multi-city itineraries, discover top activities, calculate budgets, and share your adventures seamlessly.
          </p>

          <div className="grid grid-cols-3 gap-3">
            {[
              { name: 'Paris', emoji: '🗼' },
              { name: 'Tokyo', emoji: '🗾' },
              { name: 'NYC', emoji: '🗽' },
              { name: 'Rome', emoji: '🏛️' },
              { name: 'Bali', emoji: '🌴' },
              { name: 'Prague', emoji: '🏰' },
            ].map((c) => (
              <div key={c.name} className="glass px-3 py-2.5 rounded-xl text-xs font-medium text-text flex items-center justify-center gap-1.5 shadow-sm">
                <span>{c.emoji}</span>
                <span>{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md animate-in">
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Compass size={22} />
            </div>
            <span className="font-heading font-bold text-xl tracking-tight">GlobeTrotter</span>
          </div>

          <h2 className="font-heading font-bold text-3xl mb-1.5 text-text">Welcome back</h2>
          <p className="text-muted text-sm mb-8">Sign in to continue planning your adventures</p>

          <form onSubmit={handleSubmit} className="space-y-5">
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
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="label-base !mb-0">Password</label>
                <span className="text-xs text-primary cursor-pointer hover:underline">
                  Forgot password?
                </span>
              </div>
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
                  placeholder="Enter your password"
                  className="input-base input-icon-left input-icon-right"
                  autoComplete="current-password"
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
              id="login-btn"
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 mt-2"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-muted text-sm mt-8">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-primary hover:underline font-semibold">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
