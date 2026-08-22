'use client'

import { useState } from 'react'
import { X, Plus, Loader2 } from 'lucide-react'

interface Props {
  stopId: string
  onClose: () => void
  onAdd: (data: any) => void
}

const CATEGORIES = [
  { value: 'sightseeing', label: '🏛️ Sightseeing' },
  { value: 'food', label: '🍜 Food & Dining' },
  { value: 'adventure', label: '🧗 Adventure' },
  { value: 'transport', label: '✈️ Transport' },
  { value: 'stay', label: '🏨 Stay / Hotel' },
  { value: 'other', label: '📌 Other' },
]

export default function ActivityModal({ stopId, onClose, onAdd }: Props) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    category: 'sightseeing',
    description: '',
    cost: '',
    durationHours: '',
    scheduledTime: '',
    dayNumber: '1',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setLoading(true)
    await onAdd({
      name: form.name,
      category: form.category,
      description: form.description || null,
      cost: parseFloat(form.cost) || 0,
      durationHours: parseFloat(form.durationHours) || null,
      scheduledTime: form.scheduledTime || null,
      dayNumber: parseInt(form.dayNumber) || 1,
    })
    setLoading(false)
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="font-heading font-bold text-xl">Add Activity</h2>
          <button onClick={onClose} className="p-2 hover:bg-surface2 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label htmlFor="activity-name" className="label-base">Activity Name *</label>
            <input
              id="activity-name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Visit Eiffel Tower"
              className="input-base"
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="activity-category" className="label-base">Category</label>
            <select
              id="activity-category"
              name="category"
              value={form.category}
              onChange={handleChange}
              className="input-base cursor-pointer"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value} className="bg-surface text-text">
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="activity-cost" className="label-base">Cost (USD)</label>
              <input
                id="activity-cost"
                name="cost"
                type="number"
                min="0"
                step="0.01"
                value={form.cost}
                onChange={handleChange}
                placeholder="0"
                className="input-base"
              />
            </div>
            <div>
              <label htmlFor="activity-duration" className="label-base">Duration (hours)</label>
              <input
                id="activity-duration"
                name="durationHours"
                type="number"
                min="0"
                step="0.5"
                value={form.durationHours}
                onChange={handleChange}
                placeholder="2"
                className="input-base"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="activity-time" className="label-base">Scheduled Time</label>
              <input
                id="activity-time"
                name="scheduledTime"
                type="time"
                value={form.scheduledTime}
                onChange={handleChange}
                className="input-base"
              />
            </div>
            <div>
              <label htmlFor="activity-day" className="label-base">Day Number</label>
              <input
                id="activity-day"
                name="dayNumber"
                type="number"
                min="1"
                value={form.dayNumber}
                onChange={handleChange}
                className="input-base"
              />
            </div>
          </div>

          <div>
            <label htmlFor="activity-description" className="label-base">Description (optional)</label>
            <textarea
              id="activity-description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={2}
              placeholder="Notes, booking links, or details..."
              className="input-base resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button
              id="save-activity-btn"
              type="submit"
              disabled={loading || !form.name.trim()}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <><Plus size={16} /> Add Activity</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
