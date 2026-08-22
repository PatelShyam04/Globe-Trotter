'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Search,
  Filter,
  ArrowUpDown,
  Layers,
  Users,
  Building,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  MapPin,
  Calendar,
  DollarSign,
  Activity as ActivityIcon,
  Trash2,
  Eye,
  CheckCircle2,
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
import { formatCurrency, formatDate, getCountryFlag } from '@/lib/helpers'
import toast from 'react-hot-toast'

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement
)

interface UserItem {
  id: string
  name?: string | null
  email: string
  city?: string | null
  country?: string | null
  image?: string | null
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
}

interface ActivityItem {
  id: string
  name: string
  category: string
  cost: number
}

interface TripItem {
  id: string
  name: string
  totalBudget: number
  createdAt: string
}

interface Props {
  users: UserItem[]
  cities: CityItem[]
  activities: ActivityItem[]
  trips: TripItem[]
}

type TabType = 'users' | 'cities' | 'activities' | 'analytics'

export default function AdminClient({ users, cities, activities, trips }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>('analytics')
  const [searchQuery, setSearchQuery] = useState('')
  const [userList, setUserList] = useState(users)

  // Filtered Users
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return userList
    const q = searchQuery.toLowerCase()
    return userList.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.city?.toLowerCase().includes(q)
    )
  }, [userList, searchQuery])

  // Filtered Cities
  const filteredCities = useMemo(() => {
    if (!searchQuery.trim()) return cities
    const q = searchQuery.toLowerCase()
    return cities.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q) ||
        c.region.toLowerCase().includes(q)
    )
  }, [cities, searchQuery])

  // Filtered Activities
  const filteredActivities = useMemo(() => {
    if (!searchQuery.trim()) return activities
    const q = searchQuery.toLowerCase()
    return activities.filter(
      (a) => a.name.toLowerCase().includes(q) || a.category.toLowerCase().includes(q)
    )
  }, [activities, searchQuery])

  // Analytics Chart Data
  const pieData = {
    labels: ['Europe', 'Asia', 'Americas', 'Middle East', 'Africa', 'Oceania'],
    datasets: [
      {
        data: [35, 28, 18, 10, 5, 4],
        backgroundColor: [
          'rgba(0, 212, 170, 0.8)',
          'rgba(255, 179, 71, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(244, 63, 94, 0.8)',
          'rgba(34, 197, 94, 0.8)',
        ],
        borderColor: '#111827',
        borderWidth: 2,
      },
    ],
  }

  const lineData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
    datasets: [
      {
        label: 'Trips Planned',
        data: [12, 19, 28, 45, 62, 85, 110, 145],
        borderColor: '#00D4AA',
        backgroundColor: 'rgba(0, 212, 170, 0.2)',
        tension: 0.35,
        fill: true,
      },
      {
        label: 'Active Users',
        data: [8, 15, 22, 38, 50, 70, 95, 120],
        borderColor: '#FFB347',
        backgroundColor: 'rgba(255, 179, 71, 0.1)',
        tension: 0.35,
        fill: false,
      },
    ],
  }

  const barData = {
    labels: ['Sightseeing', 'Food & Dining', 'Adventure', 'Transport', 'Stay'],
    datasets: [
      {
        label: 'Activity Bookings ($)',
        data: [4200, 3100, 2800, 3900, 5600],
        backgroundColor: 'rgba(0, 212, 170, 0.75)',
        borderRadius: 8,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { labels: { color: '#9CA3AF', font: { family: 'Inter' } } },
    },
    scales: {
      x: { ticks: { color: '#9CA3AF' }, grid: { color: 'rgba(55,65,81,0.4)' } },
      y: { ticks: { color: '#9CA3AF' }, grid: { color: 'rgba(55,65,81,0.4)' } },
    },
  }

  return (
    <div className="space-y-8 animate-in max-w-5xl mx-auto pb-16">
      {/* Screen Title */}
      <div className="border-b border-border/80 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-3xl text-text flex items-center gap-2.5">
            <ShieldCheck size={28} className="text-primary" />
            Admin Panel Screen
          </h1>
          <p className="text-muted text-sm mt-0.5">
            System administration, user metrics, popular destinations, and trend analytics
          </p>
        </div>
      </div>

      {/* Control Bar (Screen 12 wireframe) */}
      <div className="card !p-4 flex flex-col md:flex-row items-center gap-3 border border-border shadow-md">
        <div className="relative flex-1 w-full group">
          <Search
            size={18}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search bar ...... (search users, cities, trends)"
            className="input-base input-icon-left !py-2.5 text-sm"
          />
        </div>
      </div>

      {/* 4 Tab Switchers (Screen 12 wireframe) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {[
          { id: 'analytics' as TabType, label: 'User Trends and Analytics', icon: TrendingUp },
          { id: 'users' as TabType, label: 'Manage Users', icon: Users },
          { id: 'cities' as TabType, label: 'Popular cities', icon: Building },
          { id: 'activities' as TabType, label: 'Popular Activities', icon: ActivityIcon },
        ].map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`p-3.5 rounded-xl border text-xs md:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isActive
                  ? 'bg-primary text-bg border-primary shadow-lg shadow-primary/20 scale-102'
                  : 'bg-surface border-border text-muted hover:text-text hover:bg-surface2'
              }`}
            >
              <tab.icon size={16} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* TAB 1: User Trends and Analytics */}
      {activeTab === 'analytics' && (
        <div className="space-y-6 animate-in">
          {/* Top KPI row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Registered Users', value: users.length, color: 'text-primary' },
              { label: 'Total Trips Planned', value: trips.length, color: 'text-secondary' },
              { label: 'Curated Destinations', value: cities.length, color: 'text-blue-400' },
              { label: 'Avg Trip Budget', value: '$2,850', color: 'text-emerald-400' },
            ].map((kpi) => (
              <div key={kpi.label} className="card !p-4 border border-border">
                <span className="text-muted text-xs block uppercase tracking-wider font-semibold">
                  {kpi.label}
                </span>
                <span className={`font-heading font-black text-2xl mt-1 block ${kpi.color}`}>
                  {kpi.value}
                </span>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Donut / Pie Chart: Regional Popularity */}
            <div className="card !p-6 border border-border space-y-4">
              <h3 className="font-heading font-bold text-lg text-text flex items-center gap-2">
                <Sparkles size={16} className="text-primary" />
                Popular Regional Destinations
              </h3>
              <div className="h-64 flex items-center justify-center">
                <Pie data={pieData} options={{ responsive: true, plugins: { legend: { labels: { color: '#9CA3AF' } } } }} />
              </div>
            </div>

            {/* Bar Chart: Activity Category Breakdown */}
            <div className="card !p-6 border border-border space-y-4">
              <h3 className="font-heading font-bold text-lg text-text flex items-center gap-2">
                <ActivityIcon size={16} className="text-secondary" />
                Activity Category Bookings
              </h3>
              <div className="h-64">
                <Bar data={barData} options={chartOptions} />
              </div>
            </div>
          </div>

          {/* Line Chart: User Signups & Trips Planned over time */}
          <div className="card !p-6 border border-border space-y-4">
            <h3 className="font-heading font-bold text-lg text-text flex items-center gap-2">
              <TrendingUp size={16} className="text-primary" />
              Growth Trends & User Activity Over Time
            </h3>
            <div className="h-64">
              <Line data={lineData} options={chartOptions} />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Manage Users */}
      {activeTab === 'users' && (
        <div className="card !p-6 border border-border space-y-4 animate-in">
          <div className="flex items-center justify-between border-b border-border/70 pb-3">
            <h3 className="font-heading font-bold text-xl text-text flex items-center gap-2">
              <Users size={20} className="text-primary" />
              Manage Users ({filteredUsers.length})
            </h3>
          </div>

          <div className="divide-y divide-border/60">
            {filteredUsers.map((user) => (
              <div key={user.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-text">{user.name || 'Traveler'}</p>
                    <p className="text-muted text-xs">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <span className="badge bg-surface2 text-text border border-border">
                    {user._count.trips} trips
                  </span>
                  <span className="text-muted hidden sm:inline">{formatDate(user.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Popular Cities */}
      {activeTab === 'cities' && (
        <div className="card !p-6 border border-border space-y-4 animate-in">
          <div className="flex items-center justify-between border-b border-border/70 pb-3">
            <h3 className="font-heading font-bold text-xl text-text flex items-center gap-2">
              <Building size={20} className="text-secondary" />
              Popular Cities Leaderboard ({filteredCities.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredCities.map((city, idx) => (
              <div
                key={city.id}
                className="p-4 rounded-xl bg-surface2/60 border border-border flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-primary mr-1">#{idx + 1}</span>
                  <span className="font-heading font-bold text-base text-text">
                    {getCountryFlag(city.country)} {city.name}
                  </span>
                  <p className="text-muted text-xs">{city.country} · {city.region}</p>
                </div>
                <div className="text-right">
                  <span className="badge bg-primary/10 text-primary text-xs font-bold">
                    {city.popularity}/100
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Popular Activities */}
      {activeTab === 'activities' && (
        <div className="card !p-6 border border-border space-y-4 animate-in">
          <div className="flex items-center justify-between border-b border-border/70 pb-3">
            <h3 className="font-heading font-bold text-xl text-text flex items-center gap-2">
              <ActivityIcon size={20} className="text-blue-400" />
              Trending Activities ({filteredActivities.length})
            </h3>
          </div>

          <div className="space-y-2.5">
            {filteredActivities.map((act) => (
              <div
                key={act.id}
                className="p-3 bg-surface2/50 rounded-xl border border-border flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-sm text-text">{act.name}</p>
                  <span className="badge bg-surface text-muted text-[10px] uppercase">
                    {act.category}
                  </span>
                </div>
                <span className="text-secondary font-bold text-sm">
                  {formatCurrency(act.cost)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
