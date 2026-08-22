'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Sparkles,
  MessageCircle,
  X,
  Send,
  Loader2,
  Trash2,
  Compass,
  ArrowRight,
  Bot,
  User,
  Lightbulb,
  Zap,
  MapPin,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  suggestedCity?: string
  timestamp: string
}

const QUICK_PROMPTS = [
  { label: '🗼 Tokyo 3-Day Plan', prompt: 'Plan a 3-day budget itinerary for Tokyo with costs' },
  { label: '🥐 Paris Food Guide', prompt: 'What are the top food spots and cultural tours in Paris?' },
  { label: '🌴 Bali Adventure', prompt: 'Suggest an adventure and nature trip to Bali with estimated expenses' },
  { label: '💰 Budget Advice', prompt: 'How should I budget $1,500 for a multi-city vacation in Europe?' },
  { label: '🎒 Packing Checklist', prompt: 'What are essential packing and transit tips for backpacking?' },
]

export default function AIChatBot() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [generatingCity, setGeneratingCity] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        '👋 Hi! I am **GlobeBot**, your AI Travel Assistant. Ask me to plan itineraries, calculate budgets, recommend hidden spots, or auto-generate trips for ANY city worldwide!',
      timestamp: 'Just now',
    },
  ])

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150)
    }
  }, [isOpen])

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = textToSend || input
    if (!messageText.trim() || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMessage])
    if (!textToSend) setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({ role: m.role, content: m.content })),
        }),
      })

      const data = await res.json()
      if (res.ok && data.reply) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.reply,
          suggestedCity: data.suggestedCity,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
        setMessages((prev) => [...prev, botMessage])
      } else {
        throw new Error(data.error || 'Failed to get response')
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '⚠️ Oops! I had trouble connecting. Please try asking again.',
          timestamp: 'Just now',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleAutoGenerateTrip = async (destination: string) => {
    setGeneratingCity(destination)
    try {
      const res = await fetch('/api/ai/generate-trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination, days: 3, autoSave: true }),
      })
      const data = await res.json()
      if (res.ok && data.tripId) {
        toast.success(`⚡ 3-Day Trip to ${destination} generated and saved!`)
        setIsOpen(false)
        router.push(`/trips/${data.tripId}/itinerary`)
      } else {
        toast.error(data.error || 'Please sign in to save trips')
      }
    } catch {
      toast.error('Failed to create trip')
    } finally {
      setGeneratingCity(null)
    }
  }

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content:
          '👋 Hi! I am **GlobeBot**, your AI Travel Assistant. Ask me to plan itineraries, calculate budgets, recommend hidden spots, or auto-generate trips for ANY city worldwide!',
        timestamp: 'Just now',
      },
    ])
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* 1. Floating AI Assistant Launch Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative group bg-gradient-to-r from-primary to-emerald-400 text-bg p-4 rounded-2xl shadow-2xl hover:shadow-primary/40 hover:scale-105 transition-all duration-300 flex items-center gap-2.5 font-heading font-black cursor-pointer ring-4 ring-primary/20"
          aria-label="Open AI Travel Assistant"
          id="globebot-launch-btn"
        >
          <div className="relative">
            <Bot size={24} className="group-hover:rotate-12 transition-transform duration-300" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-secondary rounded-full animate-ping" />
          </div>
          <span className="hidden sm:inline text-sm">Ask GlobeBot AI</span>
          <span className="badge bg-surface/90 text-primary text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5">
            AI
          </span>
        </button>
      )}

      {/* 2. Expandable Chat Window */}
      {isOpen && (
        <div className="w-[92vw] sm:w-[440px] h-[600px] max-h-[85vh] bg-surface/95 backdrop-blur-xl border border-border/90 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in border-t-2 border-t-primary">
          {/* Header */}
          <div className="p-4 bg-surface2/80 border-b border-border/70 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-emerald-400 text-bg flex items-center justify-center shadow-md">
                <Bot size={20} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-heading font-bold text-sm text-text">GlobeBot AI</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-[11px] text-muted">Universal Travel Planner & Budget AI</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearChat}
                className="p-1.5 hover:bg-surface rounded-lg text-muted hover:text-text transition-colors"
                title="Clear Chat"
              >
                <Trash2 size={15} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-surface rounded-lg text-muted hover:text-text transition-colors"
                title="Minimize"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Quick Prompt Chips (Top Carousel) */}
          <div className="px-3 py-2 bg-surface2/40 border-b border-border/40 overflow-x-auto flex gap-1.5 scrollbar-none">
            {QUICK_PROMPTS.map((qp) => (
              <button
                key={qp.label}
                onClick={() => handleSendMessage(qp.prompt)}
                disabled={loading || Boolean(generatingCity)}
                className="px-2.5 py-1 rounded-lg bg-surface border border-border/80 hover:border-primary/50 text-[11px] text-muted hover:text-text whitespace-nowrap transition-colors flex-shrink-0 cursor-pointer disabled:opacity-50"
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
            {messages.map((msg) => {
              const isUser = msg.role === 'user'
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                      isUser
                        ? 'bg-primary/20 text-primary border border-primary/30'
                        : 'bg-surface2 text-emerald-400 border border-border'
                    }`}
                  >
                    {isUser ? <User size={13} /> : <Bot size={13} />}
                  </div>

                  <div className={`space-y-1.5 max-w-[85%] ${isUser ? 'items-end' : ''}`}>
                    <div
                      className={`p-3.5 rounded-2xl shadow-sm leading-relaxed whitespace-pre-wrap ${
                        isUser
                          ? 'bg-primary text-bg font-medium rounded-tr-none'
                          : 'bg-surface2/90 text-text border border-border/70 rounded-tl-none'
                      }`}
                    >
                      {msg.content}

                      {/* 1-Click Direct Auto-Generate Button */}
                      {!isUser && msg.suggestedCity && (
                        <div className="pt-3 mt-3 border-t border-border/50 space-y-2">
                          <button
                            onClick={() => handleAutoGenerateTrip(msg.suggestedCity!)}
                            disabled={Boolean(generatingCity)}
                            className="btn-primary w-full text-xs py-2 px-3 font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-primary/20 cursor-pointer"
                          >
                            {generatingCity === msg.suggestedCity ? (
                              <>
                                <Loader2 size={13} className="animate-spin" />
                                Generating & Saving {msg.suggestedCity} Trip...
                              </>
                            ) : (
                              <>
                                <Zap size={13} />
                                ⚡ Auto-Generate 3-Day {msg.suggestedCity} Trip
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-muted px-1 block">{msg.timestamp}</span>
                  </div>
                </div>
              )
            })}

            {loading && (
              <div className="flex items-center gap-2 text-muted text-xs p-2">
                <Loader2 size={14} className="animate-spin text-primary" />
                <span>GlobeBot is planning your itinerary...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSendMessage()
            }}
            className="p-3 bg-surface2/80 border-t border-border/70 flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask for ANY city (e.g. London, Rome, Cairo, Tokyo)..."
              className="input-base !py-2 !px-3 text-xs flex-1"
              disabled={loading || Boolean(generatingCity)}
            />
            <button
              type="submit"
              disabled={loading || !input.trim() || Boolean(generatingCity)}
              className="btn-primary !py-2 !px-3 flex items-center justify-center rounded-xl disabled:opacity-40 cursor-pointer"
              aria-label="Send message"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
