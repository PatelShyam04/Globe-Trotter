'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { formatCurrency, CATEGORY_CONFIG } from '@/lib/helpers'
import { AlertTriangle, TrendingDown, DollarSign, Clock, Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement
} from 'chart.js'
import { Pie, Bar } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement)

interface BudgetData {
  totalCost: number
  byCat: Record<string, number>
  byStop: { city: string; cost: number }[]
  avgPerDay: number
  overBudget: boolean
  budget: number
}

const CAT_COLORS: Record<string, string> = {
  sightseeing: 'rgba(59,130,246,0.8)',
  food: 'rgba(249,115,22,0.8)',
  adventure: 'rgba(34,197,94,0.8)',
  transport: 'rgba(168,85,247,0.8)',
  stay: 'rgba(0,212,170,0.8)',
  other: 'rgba(156,163,175,0.8)',
}

export default function BudgetPage() {
  const params = useParams()
  const [data, setData] = useState<BudgetData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/trips/${params.id}/budget`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false) })
  }, [params.id])

  if (loading) return (
    <div className="flex items-center justify-center min-h-96">
      <Loader2 size={40} className="text-primary animate-spin" />
    </div>
  )

  if (!data) return <div className="card text-center py-20 text-muted">Failed to load budget</div>

  const pieData = {
    labels: Object.keys(data.byCat).map((k) => CATEGORY_CONFIG[k]?.label || k),
    datasets: [{
      data: Object.values(data.byCat),
      backgroundColor: Object.keys(data.byCat).map((k) => CAT_COLORS[k] || CAT_COLORS.other),
      borderColor: 'rgba(17,24,39,0.8)',
      borderWidth: 2,
    }],
  }

  const barData = {
    labels: data.byStop.map((s) => s.city),
    datasets: [{
      label: 'Cost (USD)',
      data: data.byStop.map((s) => s.cost),
      backgroundColor: 'rgba(0,212,170,0.6)',
      borderColor: 'rgba(0,212,170,1)',
      borderWidth: 1.5,
      borderRadius: 8,
    }],
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { labels: { color: '#9CA3AF', font: { family: 'Inter' } } },
      tooltip: {
        callbacks: { label: (ctx: any) => ` ${formatCurrency(ctx.raw)}` },
      },
    },
  }

  const barOptions = {
    ...chartOptions,
    scales: {
      x: { ticks: { color: '#9CA3AF' }, grid: { color: 'rgba(55,65,81,0.5)' } },
      y: {
        ticks: { color: '#9CA3AF', callback: (v: any) => '$' + v },
        grid: { color: 'rgba(55,65,81,0.5)' },
      },
    },
  }

  return (
    <div className="max-w-5xl mx-auto animate-in">
      <div className="mb-8">
        <Link href={`/trips/${params.id}/itinerary`} className="flex items-center gap-2 text-muted hover:text-text text-sm mb-4 transition-colors">
          <ArrowLeft size={15} /> Back to Itinerary
        </Link>
        <h1 className="font-heading font-bold text-3xl">Budget & Cost Breakdown</h1>
      </div>

      {/* Over budget alert */}
      {data.overBudget && (
        <div className="flex items-center gap-3 p-4 bg-danger/10 border border-danger/30 rounded-xl mb-6 animate-in">
          <AlertTriangle size={20} className="text-danger flex-shrink-0" />
          <p className="text-danger font-medium">
            You&apos;re over budget! Spent {formatCurrency(data.totalCost)} vs budget of {formatCurrency(data.budget)}
          </p>
        </div>
      )}

      {/* Top stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { icon: DollarSign, label: 'Total Cost', value: formatCurrency(data.totalCost), color: 'text-secondary', bg: 'bg-secondary/10' },
          { icon: TrendingDown, label: 'Avg / Day', value: formatCurrency(data.avgPerDay), color: 'text-primary', bg: 'bg-primary/10' },
          { icon: Clock, label: 'Budget Set', value: data.budget > 0 ? formatCurrency(data.budget) : 'Not set', color: 'text-blue-400', bg: 'bg-blue-400/10' },
        ].map((s) => (
          <div key={s.label} className="card flex items-center gap-4">
            <div className={`w-12 h-12 ${s.bg} rounded-xl flex items-center justify-center`}>
              <s.icon className={s.color} size={22} />
            </div>
            <div>
              <p className="text-muted text-sm">{s.label}</p>
              <p className={`font-heading font-bold text-2xl ${s.color}`}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      {data.totalCost === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">💰</div>
          <h3 className="font-heading font-bold text-xl mb-2">No costs recorded yet</h3>
          <p className="text-muted">Add activities with costs in the Itinerary Builder</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <h3 className="font-heading font-semibold text-lg mb-6">Cost by Category</h3>
            <div className="h-64 flex items-center justify-center">
              <Pie data={pieData} options={chartOptions} />
            </div>
          </div>
          <div className="card">
            <h3 className="font-heading font-semibold text-lg mb-6">Cost by City</h3>
            <div className="h-64">
              <Bar data={barData} options={barOptions as any} />
            </div>
          </div>
        </div>
      )}

      {/* Line item table */}
      {Object.entries(data.byCat).length > 0 && (
        <div className="card">
          <h3 className="font-heading font-semibold text-lg mb-4">Category Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(data.byCat).sort((a, b) => b[1] - a[1]).map(([cat, cost]) => {
              const cfg = CATEGORY_CONFIG[cat] || CATEGORY_CONFIG.other
              const pct = data.totalCost > 0 ? (cost / data.totalCost) * 100 : 0
              return (
                <div key={cat} className="flex items-center gap-4">
                  <span className="text-lg w-8">{cfg.emoji}</span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">{cfg.label}</span>
                      <span className="text-sm text-secondary font-semibold">{formatCurrency(cost)}</span>
                    </div>
                    <div className="h-2 bg-surface2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted mt-1">{pct.toFixed(1)}% of total</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
