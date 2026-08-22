'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Search,
  Users,
  Building,
  TrendingUp,
  ShieldCheck,
  Activity as ActivityIcon,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Shield,
  ShieldOff,
  X,
  MapPin,
  Calendar,
  DollarSign,
  Loader2,
  ArrowUpDown,
  Globe,
  Layers,
  Sparkles,
  BarChart2,
} from 'lucide-react'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
} from 'chart.js'
import { Pie, Line, Bar } from 'react-chartjs-2'
import { formatCurrency, formatDate, getCountryFlag, CATEGORY_CONFIG } from '@/lib/helpers'
import toast from 'react-hot-toast'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement)

/* ──────────────── Types ──────────────── */
interface UserItem {
  id: string
  name?: string | null
  email: string
  phone?: string | null
  city?: string | null
  country?: string | null
  image?: string | null
  role: string
  createdAt: string
  _count: { trips: number }
}

interface CityItem {
  id: string
  name: string
  country: string
  region: string
  costIndex: number
  popularity: number
  description?: string | null
}

interface ActivityItem {
  id: string
  name: string
  category: string
  cost: number
  stop: { cityName: string; country?: string | null }
}

interface Props {
  cities: CityItem[]
  cityUsageMap: Record<string, number>
  activities: ActivityItem[]
  currentUserId: string
}

interface TripItem {
  id: string
  name: string
  startDate?: string | null
  endDate?: string | null
  isPublic: boolean
  totalBudget: number
  stops: { activities: { cost: number }[] }[]
}

type TabType = 'analytics' | 'users' | 'cities' | 'activities'

/* ──────────────── Main Component ──────────────── */
export default function AdminClient({ cities, cityUsageMap, activities, currentUserId }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>('analytics')
  const [searchQuery, setSearchQuery] = useState('')

  /* ── Users State ── */
  const [users, setUsers] = useState<UserItem[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const [userSearch, setUserSearch] = useState('')

  /* ── Trip Viewer Modal ── */
  const [viewingUser, setViewingUser] = useState<UserItem | null>(null)
  const [userTrips, setUserTrips] = useState<TripItem[]>([])
  const [tripsLoading, setTripsLoading] = useState(false)

  /* ── Analytics State ── */
  const [stats, setStats] = useState<any>(null)
  const [statsLoading, setStatsLoading] = useState(false)

  /* ── Activity Filters ── */
  const [actCategoryFilter, setActCategoryFilter] = useState('all')
  const [actSort, setActSort] = useState<'name' | 'cost_asc' | 'cost_desc'>('cost_desc')

  /* ──────────── Fetch Users ──────────── */
  const fetchUsers = useCallback(async (p: number, q: string) => {
    setUsersLoading(true)
    try {
      const res = await fetch(`/api/admin/users?page=${p}&search=${encodeURIComponent(q)}`)
      const data = await res.json()
      if (res.ok) {
        setUsers(data.users)
        setTotalPages(data.totalPages)
        setTotalUsers(data.total)
      } else {
        toast.error(data.error || 'Failed to load users')
      }
    } finally {
      setUsersLoading(false)
    }
  }, [])

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers(page, userSearch)
    }
  }, [activeTab, page, fetchUsers])

  /* ──────────── Fetch Stats ──────────── */
  useEffect(() => {
    if (activeTab === 'analytics' && !stats) {
      setStatsLoading(true)
      fetch('/api/admin/stats')
        .then(r => r.json())
        .then(d => { setStats(d); setStatsLoading(false) })
        .catch(() => setStatsLoading(false))
    }
  }, [activeTab, stats])

  /* ──────────── Handlers ──────────── */
  const handleUserSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchUsers(1, userSearch)
  }

  const handleDeleteUser = async (userId: string, name: string) => {
    if (!confirm(`Permanently delete user "${name}"? This removes all their trips and data.`)) return
    const res = await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    const data = await res.json()
    if (res.ok) {
      toast.success('User deleted successfully')
      setUsers(prev => prev.filter(u => u.id !== userId))
      setTotalUsers(prev => prev - 1)
    } else {
      toast.error(data.error || 'Failed to delete user')
    }
  }

  const handleToggleRole = async (userId: string, currentRole: string) => {
    const action = currentRole === 'admin' ? 'Remove admin access from' : 'Grant admin access to'
    const target = users.find(u => u.id === userId)
    if (!confirm(`${action} "${target?.name || target?.email}"?`)) return

    const res = await fetch(`/api/admin/users/${userId}/role`, { method: 'PUT' })
    const data = await res.json()
    if (res.ok) {
      toast.success(`Role updated to ${data.user.role}`)
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: data.user.role } : u))
    } else {
      toast.error(data.error || 'Failed to update role')
    }
  }

  const handleViewTrips = async (user: UserItem) => {
    setViewingUser(user)
    setTripsLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${user.id}/trips`)
      const data = await res.json()
      if (res.ok) setUserTrips(data.trips)
      else toast.error('Failed to load user trips')
    } finally {
      setTripsLoading(false)
    }
  }

  /* ──────────── Filtered Activities ──────────── */
  const filteredActivities = useMemo(() => {
    let list = [...activities]
    if (actCategoryFilter !== 'all') list = list.filter(a => a.category === actCategoryFilter)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(a => a.name.toLowerCase().includes(q) || a.stop.cityName.toLowerCase().includes(q))
    }
    if (actSort === 'cost_desc') list.sort((a, b) => b.cost - a.cost)
    else if (actSort === 'cost_asc') list.sort((a, b) => a.cost - b.cost)
    else list.sort((a, b) => a.name.localeCompare(b.name))
    return list
  }, [activities, actCategoryFilter, searchQuery, actSort])

  /* ──────────── Filtered Cities ──────────── */
  const filteredCities = useMemo(() => {
    if (!searchQuery.trim()) return cities
    const q = searchQuery.toLowerCase()
    return cities.filter(c => c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q) || c.region.toLowerCase().includes(q))
  }, [cities, searchQuery])

  /* ──────────── Chart Configs ──────────── */
  const chartTextColor = '#9CA3AF'
  const gridColor = 'rgba(55,65,81,0.4)'

  const pieData = stats ? {
    labels: stats.popularDestinations.map((d: any) => `${d.cityName}`),
    datasets: [{
      data: stats.popularDestinations.map((d: any) => d.count),
      backgroundColor: ['rgba(0,212,170,0.8)', 'rgba(255,179,71,0.8)', 'rgba(59,130,246,0.8)', 'rgba(168,85,247,0.8)', 'rgba(244,63,94,0.8)', 'rgba(34,197,94,0.8)'],
      borderColor: '#111827',
      borderWidth: 2,
    }],
  } : null

  const lineData = stats ? {
    labels: stats.monthly.labels,
    datasets: [
      {
        label: 'Trips Planned',
        data: stats.monthly.trips,
        borderColor: '#00D4AA',
        backgroundColor: 'rgba(0,212,170,0.15)',
        tension: 0.35,
        fill: true,
        pointBackgroundColor: '#00D4AA',
      },
      {
        label: 'New Users',
        data: stats.monthly.users,
        borderColor: '#FFB347',
        backgroundColor: 'rgba(255,179,71,0.05)',
        tension: 0.35,
        fill: false,
        pointBackgroundColor: '#FFB347',
      },
    ],
  } : null

  const barData = stats ? {
    labels: stats.categories.labels,
    datasets: [{
      label: 'Total Spend ($)',
      data: stats.categories.totals,
      backgroundColor: 'rgba(0,212,170,0.75)',
      borderRadius: 8,
    }],
  } : null

  const chartOpts = {
    responsive: true,
    plugins: { legend: { labels: { color: chartTextColor, font: { family: 'Inter' } } } },
    scales: {
      x: { ticks: { color: chartTextColor }, grid: { color: gridColor } },
      y: { ticks: { color: chartTextColor }, grid: { color: gridColor } },
    },
  }

  /* ──────────── Render ──────────── */
  return (
    <div className="space-y-8 animate-in max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="border-b border-border/80 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-3xl text-text flex items-center gap-2.5">
            <ShieldCheck size={28} className="text-primary" />
            Admin Panel
          </h1>
          <p className="text-muted text-sm mt-0.5">
            Platform administration — manage users, cities, activities, and view live analytics
          </p>
        </div>
        <span className="badge bg-primary/15 text-primary text-xs font-semibold flex items-center gap-1 self-start sm:self-auto">
          <ShieldCheck size={12} /> Admin Access
        </span>
      </div>

      {/* Global Search Bar */}
      <div className="card !p-4 border border-border shadow-md">
        <div className="relative group">
          <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search bar ...... (search cities, activities)"
            className="input-base input-icon-left !py-2.5 text-sm"
          />
        </div>
      </div>

      {/* Tab Switchers (Screen 12 wireframe) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {([
          { id: 'analytics', label: 'User Trends and Analytics', icon: TrendingUp },
          { id: 'users', label: 'Manage Users', icon: Users },
          { id: 'cities', label: 'Popular Cities', icon: Building },
          { id: 'activities', label: 'Popular Activities', icon: ActivityIcon },
        ] as { id: TabType; label: string; icon: any }[]).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`p-3 md:p-4 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-primary text-bg border-primary shadow-lg shadow-primary/20'
                : 'bg-surface border-border text-muted hover:text-text hover:bg-surface2 hover:border-border/80'
            }`}
          >
            <tab.icon size={15} />
            <span className="leading-tight text-center">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ═══════════════ TAB: User Trends and Analytics ═══════════════ */}
      {activeTab === 'analytics' && (
        <div className="space-y-6 animate-in">
          {statsLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={36} className="text-primary animate-spin" />
            </div>
          ) : stats ? (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { label: 'Total Users', value: stats.kpis.totalUsers, color: 'text-primary' },
                  { label: 'Total Trips', value: stats.kpis.totalTrips, color: 'text-secondary' },
                  { label: 'Total Activities', value: stats.kpis.totalActivities, color: 'text-blue-400' },
                  { label: 'Public Trips', value: stats.kpis.publicTrips, color: 'text-emerald-400' },
                  { label: 'Admin Users', value: stats.kpis.adminUsers, color: 'text-purple-400' },
                  { label: 'Avg Budget', value: formatCurrency(stats.kpis.avgBudget), color: 'text-secondary' },
                ].map(kpi => (
                  <div key={kpi.label} className="card !p-4 border border-border text-center">
                    <span className={`font-heading font-black text-2xl block ${kpi.color}`}>{kpi.value}</span>
                    <span className="text-muted text-[11px] uppercase tracking-wider font-semibold mt-1 block">{kpi.label}</span>
                  </div>
                ))}
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pie: Popular Destinations */}
                <div className="card !p-6 border border-border space-y-4">
                  <h3 className="font-heading font-bold text-lg text-text flex items-center gap-2">
                    <Globe size={16} className="text-primary" />
                    Top Destinations (by Trips)
                  </h3>
                  {pieData && (
                    <div className="h-64 flex items-center justify-center">
                      <Pie data={pieData} options={{ responsive: true, plugins: { legend: { labels: { color: chartTextColor } } } }} />
                    </div>
                  )}
                </div>

                {/* Bar: Activity Category Spend */}
                <div className="card !p-6 border border-border space-y-4">
                  <h3 className="font-heading font-bold text-lg text-text flex items-center gap-2">
                    <BarChart2 size={16} className="text-secondary" />
                    Spending by Activity Category ($)
                  </h3>
                  {barData && (
                    <div className="h-64">
                      <Bar data={barData} options={chartOpts} />
                    </div>
                  )}
                </div>
              </div>

              {/* Line: Growth Trends */}
              <div className="card !p-6 border border-border space-y-4">
                <h3 className="font-heading font-bold text-lg text-text flex items-center gap-2">
                  <TrendingUp size={16} className="text-primary" />
                  User Signups & Trips Planned (Last 6 Months)
                </h3>
                {lineData && (
                  <div className="h-64">
                    <Line data={lineData} options={chartOpts} />
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="card text-center py-12 text-muted">Failed to load analytics data.</div>
          )}
        </div>
      )}

      {/* ═══════════════ TAB: Manage Users ═══════════════ */}
      {activeTab === 'users' && (
        <div className="space-y-4 animate-in">
          {/* User Search */}
          <form onSubmit={handleUserSearch} className="flex gap-2">
            <div className="relative flex-1 group">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                placeholder="Search by name, email, or city..."
                className="input-base input-icon-left !py-2.5 text-sm"
              />
            </div>
            <button type="submit" className="btn-primary text-xs py-2 px-4 font-semibold">
              Search
            </button>
          </form>

          <div className="flex items-center justify-between text-xs text-muted pb-1">
            <span className="font-semibold">
              {usersLoading ? 'Loading...' : `${totalUsers} registered user${totalUsers !== 1 ? 's' : ''}`}
            </span>
            <span>Page {page} of {totalPages}</span>
          </div>

          {/* Users Table */}
          <div className="card !p-0 border border-border overflow-hidden">
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-2 px-5 py-3 border-b border-border/70 bg-surface2/60 text-[11px] font-bold text-muted uppercase tracking-wider">
              <div className="col-span-3">User</div>
              <div className="col-span-3">Contact</div>
              <div className="col-span-2">Location</div>
              <div className="col-span-1 text-center">Trips</div>
              <div className="col-span-1 text-center">Role</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {usersLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={28} className="text-primary animate-spin" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12 text-muted text-sm">No users found.</div>
            ) : (
              <div className="divide-y divide-border/50">
                {users.map(user => (
                  <div key={user.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 px-5 py-4 hover:bg-surface2/40 transition-colors items-center">
                    {/* Avatar + Name */}
                    <div className="md:col-span-3 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0 overflow-hidden">
                        {user.image
                          ? <img src={user.image} alt={user.name || 'User'} className="w-full h-full object-cover" />
                          : user.name?.charAt(0)?.toUpperCase() || 'U'
                        }
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-text truncate">{user.name || 'Unnamed'}</p>
                        <p className="text-muted text-xs truncate">{formatDate(user.createdAt)}</p>
                      </div>
                    </div>

                    {/* Contact */}
                    <div className="md:col-span-3 min-w-0">
                      <p className="text-xs text-text truncate">{user.email}</p>
                      <p className="text-muted text-xs">{user.phone || '—'}</p>
                    </div>

                    {/* Location */}
                    <div className="md:col-span-2">
                      <p className="text-xs text-muted">{[user.city, user.country].filter(Boolean).join(', ') || '—'}</p>
                    </div>

                    {/* Trip Count */}
                    <div className="md:col-span-1 flex md:justify-center">
                      <span className="badge bg-primary/10 text-primary font-bold text-xs">
                        {user._count.trips}
                      </span>
                    </div>

                    {/* Role Badge */}
                    <div className="md:col-span-1 flex md:justify-center">
                      <span className={`badge text-xs font-bold ${user.role === 'admin' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-surface2 text-muted border border-border'}`}>
                        {user.role === 'admin' ? '👑 Admin' : 'User'}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="md:col-span-2 flex items-center gap-1.5 md:justify-end flex-wrap">
                      <button
                        onClick={() => handleViewTrips(user)}
                        className="btn-secondary text-[11px] py-1.5 px-2.5 flex items-center gap-1 font-semibold"
                        title="View Trips"
                      >
                        <Eye size={12} /> Trips
                      </button>
                      {user.id !== currentUserId && (
                        <>
                          <button
                            onClick={() => handleToggleRole(user.id, user.role)}
                            className={`text-[11px] py-1.5 px-2.5 rounded-lg flex items-center gap-1 font-semibold border transition-colors ${
                              user.role === 'admin'
                                ? 'bg-purple-500/10 border-purple-500/30 text-purple-300 hover:bg-purple-500/20'
                                : 'bg-surface2 border-border text-muted hover:text-primary hover:border-primary/50'
                            }`}
                            title={user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                          >
                            {user.role === 'admin' ? <ShieldOff size={12} /> : <Shield size={12} />}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id, user.name || user.email)}
                            className="btn-danger text-[11px] py-1.5 px-2.5 flex items-center gap-1"
                            title="Delete User"
                          >
                            <Trash2 size={12} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => { setPage(p => Math.max(1, p - 1)); fetchUsers(Math.max(1, page - 1), userSearch) }}
              disabled={page <= 1 || usersLoading}
              className="btn-secondary text-xs py-2 px-4 flex items-center gap-1 disabled:opacity-40"
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <span className="text-muted text-xs font-semibold">Page {page} / {totalPages}</span>
            <button
              onClick={() => { setPage(p => Math.min(totalPages, p + 1)); fetchUsers(Math.min(totalPages, page + 1), userSearch) }}
              disabled={page >= totalPages || usersLoading}
              className="btn-secondary text-xs py-2 px-4 flex items-center gap-1 disabled:opacity-40"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════ TAB: Popular Cities ═══════════════ */}
      {activeTab === 'cities' && (
        <div className="space-y-4 animate-in">
          <div className="flex items-center justify-between pb-2">
            <h2 className="font-heading font-bold text-2xl text-text flex items-center gap-2">
              <Building size={22} className="text-secondary" />
              Popular Cities Leaderboard
            </h2>
            <span className="badge bg-secondary/10 text-secondary text-xs font-semibold">
              {filteredCities.length} cities
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredCities.map((city, idx) => {
              const usageCount = cityUsageMap[city.name] || 0
              const costLabel = city.costIndex <= 0.8 ? '$ Budget' : city.costIndex <= 1.2 ? '$$ Mid' : '$$$ Premium'

              return (
                <div key={city.id} className="card !p-4 border border-border hover:border-primary/40 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-black text-primary/60 text-sm">#{idx + 1}</span>
                      <span className="text-xl">{getCountryFlag(city.country)}</span>
                      <div>
                        <h3 className="font-heading font-bold text-sm text-text">{city.name}</h3>
                        <p className="text-muted text-[11px]">{city.country} · {city.region}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap mt-2">
                    <span className="badge bg-primary/10 text-primary text-[11px] font-bold">
                      {city.popularity}/100 popularity
                    </span>
                    <span className="badge bg-secondary/10 text-secondary text-[11px] font-bold">
                      {costLabel}
                    </span>
                    {usageCount > 0 && (
                      <span className="badge bg-blue-500/10 text-blue-300 text-[11px]">
                        {usageCount} trips
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ═══════════════ TAB: Popular Activities ═══════════════ */}
      {activeTab === 'activities' && (
        <div className="space-y-4 animate-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
            <h2 className="font-heading font-bold text-2xl text-text flex items-center gap-2">
              <ActivityIcon size={22} className="text-blue-400" />
              Popular Activities
            </h2>

            <div className="flex gap-2">
              {/* Category filter */}
              <div className="relative">
                <Layers size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                <select
                  value={actCategoryFilter}
                  onChange={e => setActCategoryFilter(e.target.value)}
                  className="input-base !py-2 !pl-9 !pr-8 text-xs font-medium cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  <option value="sightseeing">Sightseeing</option>
                  <option value="food">Food & Dining</option>
                  <option value="adventure">Adventure</option>
                  <option value="transport">Transport</option>
                  <option value="stay">Stay</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Sort by */}
              <div className="relative">
                <ArrowUpDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                <select
                  value={actSort}
                  onChange={e => setActSort(e.target.value as any)}
                  className="input-base !py-2 !pl-9 !pr-8 text-xs font-medium cursor-pointer"
                >
                  <option value="cost_desc">Sort: Highest Cost</option>
                  <option value="cost_asc">Sort: Lowest Cost</option>
                  <option value="name">Sort: Name A-Z</option>
                </select>
              </div>
            </div>
          </div>

          <div className="card !p-0 border border-border overflow-hidden">
            {/* Header row */}
            <div className="hidden md:grid grid-cols-12 gap-2 px-5 py-3 bg-surface2/60 border-b border-border/70 text-[11px] font-bold text-muted uppercase tracking-wider">
              <div className="col-span-5">Activity Name</div>
              <div className="col-span-2 text-center">Category</div>
              <div className="col-span-3">Destination</div>
              <div className="col-span-2 text-right">Cost</div>
            </div>

            {filteredActivities.length === 0 ? (
              <div className="text-center py-12 text-muted text-sm">No activities found.</div>
            ) : (
              <div className="divide-y divide-border/50 max-h-[60vh] overflow-y-auto">
                {filteredActivities.map(act => {
                  const cat = CATEGORY_CONFIG[act.category] || CATEGORY_CONFIG.other
                  return (
                    <div key={act.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 px-5 py-3.5 hover:bg-surface2/40 transition-colors items-center">
                      <div className="md:col-span-5 flex items-center gap-2.5">
                        <span className="text-lg">{cat.emoji}</span>
                        <p className="font-semibold text-sm text-text truncate">{act.name}</p>
                      </div>
                      <div className="md:col-span-2 flex md:justify-center">
                        <span className={`badge ${cat.color} text-[11px]`}>{cat.label}</span>
                      </div>
                      <div className="md:col-span-3">
                        <p className="text-xs text-muted flex items-center gap-1">
                          <MapPin size={11} className="text-primary flex-shrink-0" />
                          {act.stop.cityName}{act.stop.country ? `, ${act.stop.country}` : ''}
                        </p>
                      </div>
                      <div className="md:col-span-2 md:text-right">
                        <span className="text-secondary font-bold text-sm">{formatCurrency(act.cost)}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════ Trip Viewer Modal ════════ */}
      {viewingUser && (
        <div className="modal-backdrop" onClick={() => setViewingUser(null)}>
          <div className="modal-box !max-w-2xl p-0 overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface2/80">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  {viewingUser.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-text">{viewingUser.name || 'User'}</h3>
                  <p className="text-muted text-xs">{viewingUser.email} — {viewingUser._count.trips} trip{viewingUser._count.trips !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <button onClick={() => setViewingUser(null)} className="p-1.5 hover:bg-surface rounded-lg text-muted hover:text-text">
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 max-h-[60vh] overflow-y-auto space-y-3">
              {tripsLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 size={28} className="text-primary animate-spin" />
                </div>
              ) : userTrips.length === 0 ? (
                <div className="text-center py-10 text-muted text-sm">This user has no trips yet.</div>
              ) : (
                userTrips.map(trip => {
                  const totalSpend = trip.stops.flatMap(s => s.activities).reduce((sum, a) => sum + a.cost, 0)
                  return (
                    <div key={trip.id} className="p-4 bg-surface2 rounded-xl border border-border flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-heading font-bold text-sm text-text truncate">{trip.name}</h4>
                        <div className="flex items-center gap-3 text-xs text-muted mt-0.5">
                          <span className="flex items-center gap-1">
                            <Calendar size={11} />
                            {trip.startDate ? formatDate(trip.startDate) : 'Dates TBD'}
                          </span>
                          <span className="text-secondary font-semibold">
                            {formatCurrency(totalSpend)}
                          </span>
                          {trip.isPublic && <span className="badge bg-primary/10 text-primary text-[10px]">Public</span>}
                        </div>
                      </div>
                      <Link
                        href={`/trips/${trip.id}/itinerary`}
                        target="_blank"
                        className="btn-secondary text-[11px] py-1.5 px-2.5 flex items-center gap-1 whitespace-nowrap font-semibold"
                      >
                        <Eye size={12} /> View
                      </Link>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
