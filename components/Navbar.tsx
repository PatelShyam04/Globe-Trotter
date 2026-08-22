'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  Globe,
  LayoutDashboard,
  Map,
  User,
  LogOut,
  Plus,
} from 'lucide-react'

const navLinks = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/trips', icon: Map, label: 'My Trips' },
  { href: '/profile', icon: User, label: 'Profile' },
]

interface NavbarProps {
  user?: { name?: string | null; email?: string | null; image?: string | null }
}

export default function Navbar({ user }: NavbarProps) {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-surface border-r border-border flex flex-col z-40">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
            <Globe size={20} className="text-primary" />
          </div>
          <span className="font-heading font-bold text-lg">GlobeTrotter</span>
        </Link>
      </div>

      {/* Create Trip CTA */}
      <div className="p-4">
        <Link
          href="/trips/create"
          id="new-trip-btn"
          className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 text-sm"
        >
          <Plus size={16} />
          New Trip
        </Link>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-4 py-2 space-y-1">
        {navLinks.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`nav-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-muted truncate">{user?.email}</p>
          </div>
        </div>
        <button
          id="signout-btn"
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="btn-secondary w-full flex items-center justify-center gap-2 py-2 text-sm"
        >
          <LogOut size={15} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
