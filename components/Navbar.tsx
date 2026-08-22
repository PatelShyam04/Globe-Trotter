'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useState } from 'react'
import {
  Globe,
  LayoutDashboard,
  Map,
  User,
  LogOut,
  Plus,
  Compass,
  ChevronDown,
} from 'lucide-react'

interface NavbarProps {
  user?: { name?: string | null; email?: string | null; image?: string | null }
}

export default function Navbar({ user }: NavbarProps) {
  const pathname = usePathname()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/trips', label: 'My Trips' },
    { href: '/profile', label: 'Profile' },
  ]

  return (
    <header className="sticky top-0 z-50 bg-surface/90 backdrop-blur-md border-b border-border/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand Logo */}
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
            <Compass size={20} />
          </div>
          <span className="font-heading font-black text-xl tracking-tight text-text">
            GlobeTrotter
          </span>
        </Link>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-surface2/60 p-1 rounded-xl border border-border/50">
          {navLinks.map(({ href, label }) => {
            const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary text-bg font-semibold shadow-sm shadow-primary/20'
                    : 'text-muted hover:text-text hover:bg-surface2'
                }`}
              >
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Right: Quick CTA & User Avatar */}
        <div className="flex items-center gap-3">
          <Link
            href="/trips/create"
            id="header-plan-trip-btn"
            className="hidden sm:flex btn-primary text-xs py-2 px-3.5 items-center gap-1.5 font-semibold shadow-sm"
          >
            <Plus size={14} />
            Plan a trip
          </Link>

          {/* User Profile Avatar Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-primary/40 transition-all cursor-pointer"
              aria-label="User menu"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary/30 to-secondary/30 border-2 border-primary/50 flex items-center justify-center text-sm font-bold text-primary overflow-hidden shadow-inner">
                {user?.image ? (
                  <img src={user.image} alt={user.name || 'User'} className="w-full h-full object-cover" />
                ) : (
                  user?.name?.charAt(0)?.toUpperCase() || 'U'
                )}
              </div>
            </button>

            {dropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-56 bg-surface border border-border rounded-2xl shadow-2xl py-2 animate-in z-50"
                onClick={() => setDropdownOpen(false)}
              >
                <div className="px-4 py-2 border-b border-border">
                  <p className="font-semibold text-sm truncate">{user?.name || 'Explorer'}</p>
                  <p className="text-xs text-muted truncate">{user?.email}</p>
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
  )
}
