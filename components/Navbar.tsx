'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import {
  Globe,
  LayoutDashboard,
  Map,
  User,
  LogOut,
  Plus,
  Compass,
  Calendar as CalendarIcon,
  Users,
  Search,
  ShieldCheck,
  Menu,
  X,
} from 'lucide-react'

interface NavbarProps {
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
    role?: string | null
  }
}

export default function Navbar({ user: initialUser }: NavbarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Use session user or fallback to initial prop
  const currentUser = (session?.user as any) || initialUser
  const isAdmin = currentUser?.role === 'admin'

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/trips', label: 'My Trips', icon: Map },
    { href: '/explore', label: 'Explore', icon: Search },
    { href: '/community', label: 'Community', icon: Users },
    { href: '/calendar', label: 'Calendar', icon: CalendarIcon },
    ...(isAdmin ? [{ href: '/admin', label: 'Admin', icon: ShieldCheck }] : []),
  ]

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false)
    setDropdownOpen(false)
  }, [pathname])

  return (
    <>
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-border/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left: Brand Logo & Mobile Menu Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-muted hover:text-text hover:bg-surface2 transition-colors cursor-pointer"
              aria-label="Toggle mobile menu"
            >
              <Menu size={22} />
            </button>

            <Link href="/dashboard" className="flex items-center gap-2.5 group flex-shrink-0">
              <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                <Compass size={20} />
              </div>
              <span className="font-heading font-black text-xl tracking-tight text-text">
                GlobeTrotter
              </span>
            </Link>
          </div>

          {/* Center: Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-surface2/60 p-1 rounded-xl border border-border/50">
            {navLinks.map(({ href, label }) => {
              const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
              return (
                <Link
                  key={href}
                  href={href}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-primary text-bg shadow-sm shadow-primary/20'
                      : 'text-muted hover:text-text hover:bg-surface2'
                  }`}
                >
                  {label}
                </Link>
              )
            })}
          </nav>

          {/* Right: Quick CTA & User Avatar */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/trips/create"
              id="header-plan-trip-btn"
              className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 font-semibold shadow-sm whitespace-nowrap"
            >
              <Plus size={14} />
              <span className="hidden sm:inline">Plan a trip</span>
            </Link>

            {/* User Profile Avatar Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-primary/40 transition-all cursor-pointer"
                aria-label="User menu"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary/30 to-secondary/30 border-2 border-primary/50 flex items-center justify-center text-sm font-bold text-primary overflow-hidden shadow-inner">
                  {currentUser?.image ? (
                    <img
                      src={currentUser.image}
                      alt={currentUser.name || 'User'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  ) : (
                    currentUser?.name?.charAt(0)?.toUpperCase() || 'U'
                  )}
                </div>
              </button>

              {dropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-surface border border-border rounded-2xl shadow-2xl py-2 animate-in z-50"
                  onClick={() => setDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-border">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm truncate">{currentUser?.name || 'Explorer'}</p>
                      {isAdmin && (
                        <span className="badge bg-purple-500/20 text-purple-300 text-[10px] font-bold">
                          Admin
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted truncate">{currentUser?.email}</p>
                  </div>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-muted hover:text-text hover:bg-surface2 transition-colors"
                  >
                    <LayoutDashboard size={15} /> Dashboard
                  </Link>
                  <Link
                    href="/trips"
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-muted hover:text-text hover:bg-surface2 transition-colors"
                  >
                    <Map size={15} /> My Trips
                  </Link>
                  <Link
                    href="/profile"
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-muted hover:text-text hover:bg-surface2 transition-colors"
                  >
                    <User size={15} /> Profile & Settings
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-purple-300 hover:text-purple-200 hover:bg-purple-500/10 transition-colors"
                    >
                      <ShieldCheck size={15} /> Admin Panel
                    </Link>
                  )}
                  <div className="border-t border-border my-1" />
                  <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-danger hover:bg-danger/10 transition-colors text-left"
                  >
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Slide-Over Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-surface border-r border-border shadow-2xl p-6 flex flex-col justify-between animate-in">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-border/70 pb-4">
                <Link href="/dashboard" className="flex items-center gap-2">
                  <Compass size={24} className="text-primary" />
                  <span className="font-heading font-black text-xl text-text">GlobeTrotter</span>
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-surface2"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>

              {/* User Profile Card */}
              <div className="p-3 bg-surface2/60 rounded-xl border border-border/50 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-sm">
                  {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-text truncate">{currentUser?.name || 'Explorer'}</p>
                  <p className="text-muted text-xs truncate">{currentUser?.email}</p>
                </div>
              </div>

              {/* Navigation Links */}
              <nav className="space-y-1.5">
                {navLinks.map(({ href, label, icon: Icon }) => {
                  const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        isActive
                          ? 'bg-primary text-bg shadow-md shadow-primary/20'
                          : 'text-muted hover:text-text hover:bg-surface2'
                      }`}
                    >
                      <Icon size={18} />
                      <span>{label}</span>
                    </Link>
                  )
                })}
                <Link
                  href="/profile"
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    pathname === '/profile'
                      ? 'bg-primary text-bg'
                      : 'text-muted hover:text-text hover:bg-surface2'
                  }`}
                >
                  <User size={18} />
                  <span>Profile & Settings</span>
                </Link>
              </nav>
            </div>

            {/* Bottom Sign Out */}
            <div className="pt-4 border-t border-border">
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-danger bg-danger/10 hover:bg-danger/20 transition-colors"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
