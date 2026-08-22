'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X, Plus, Star, DollarSign, Globe } from 'lucide-react'

interface City {
  id: string; name: string; country: string; region: string;
  costIndex: number; popularity: number; imageUrl?: string | null; description?: string | null
}

interface Props {
  onClose: () => void
  onAdd: (city: { name: string; country: string; costIndex: number }) => void
}

const REGIONS = ['All', 'Europe', 'Asia', 'Americas', 'Africa', 'Oceania', 'Middle East']

export default function CitySearchModal({ onClose, onAdd }: Props) {
  const [query, setQuery] = useState('')
  const [region, setRegion] = useState('All')
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const search = async (q: string, r: string) => {
    setLoading(true)
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (r && r !== 'All') params.set('region', r)
    const res = await fetch(`/api/cities?${params}`)
    if (res.ok) setCities(await res.json())
    setLoading(false)
  }

  useEffect(() => {
    inputRef.current?.focus()
    search('', 'All')
  }, [])

  const handleQueryChange = (v: string) => {
    setQuery(v)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(v, region), 350)
  }

  const handleRegionChange = (r: string) => {
    setRegion(r)
    search(query, r)
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <Globe size={20} className="text-primary" />
            <h2 className="font-heading font-bold text-xl">Search Cities</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surface2 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-border space-y-4">
          <div className="relative group">
            <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Search city or country..."
              className="input-base input-icon-left"
              id="city-search-input"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {REGIONS.map((r) => (
              <button
                key={r}
                onClick={() => handleRegionChange(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  region === r
                    ? 'bg-primary text-bg'
                    : 'bg-surface2 text-muted hover:text-text'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-center py-8 text-muted">Searching...</div>
          ) : cities.length === 0 ? (
            <div className="text-center py-8 text-muted">No cities found</div>
          ) : (
            cities.map((city) => (
              <div
                key={city.id}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface2 transition-colors group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-surface2 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                  🌍
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">{city.name}</p>
                  <p className="text-muted text-xs">{city.country} · {city.region}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs text-secondary">
                      <DollarSign size={10} /> Index: {city.costIndex.toFixed(1)}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted">
                      <Star size={10} className="fill-muted" /> {city.popularity}/100
                    </span>
                  </div>
                </div>
                <button
                  id={`add-city-${city.name.toLowerCase().replace(/\s/g, '-')}`}
                  onClick={() => onAdd({ name: city.name, country: city.country, costIndex: city.costIndex })}
                  className="btn-primary py-2 px-4 text-sm flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Plus size={14} /> Add
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
