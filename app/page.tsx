import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Globe, MapPin, Wallet, Share2, ArrowRight, Star, Compass } from 'lucide-react'

export default async function LandingPage() {
  const session = await auth()

  // If user is already logged in, redirect them directly to the main dashboard!
  if (session?.user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-bg overflow-hidden">
      {/* Gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-secondary/8 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 right-1/3 w-80 h-80 bg-primary/8 rounded-full blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Compass className="text-primary" size={28} />
          <span className="font-heading font-bold text-xl">GlobeTrotter</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-muted hover:text-text transition-colors font-medium">
            Sign In
          </Link>
          <Link href="/signup" className="btn-primary text-sm py-2 px-5">
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 text-center pt-20 pb-32 px-6 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 text-primary text-sm font-medium mb-8">
          <Star size={14} fill="currentColor" />
          Hackathon 2026 – Travel Planning Reimagined
        </div>

        <h1 className="font-heading font-black text-6xl md:text-7xl text-text leading-tight mb-6">
          Plan Your Perfect
          <br />
          <span className="gradient-text">Multi-City Trip</span>
        </h1>

        <p className="text-muted text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
          Create stunning itineraries, manage budgets, discover activities, and share your
          adventures — all in one intelligent travel platform.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/signup" className="btn-primary flex items-center gap-2 justify-center text-lg py-4 px-8">
            Start Planning Free
            <ArrowRight size={20} />
          </Link>
          <Link href="/login" className="btn-secondary flex items-center gap-2 justify-center text-lg py-4 px-8">
            Sign In
          </Link>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-12 mt-20">
          {[
            { label: 'Cities Available', value: '30+' },
            { label: 'Features Built', value: '13' },
            { label: 'Hours to Build', value: '8' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-heading font-bold text-3xl gradient-text">{s.value}</div>
              <div className="text-muted text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-24">
        <h2 className="font-heading font-bold text-3xl text-center mb-12">Everything You Need</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: MapPin, title: 'Multi-City Itineraries', desc: 'Add cities, stops, and activities. Reorder with ease.' },
            { icon: Wallet, title: 'Budget Tracking', desc: 'Auto cost breakdowns with charts. Never overspend.' },
            { icon: Globe, title: 'City Discovery', desc: 'Search 30+ curated cities with cost and popularity data.' },
            { icon: Share2, title: 'Share & Inspire', desc: 'Make trips public. Share links. Copy others\' plans.' },
          ].map((f) => (
            <div key={f.title} className="card hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 group">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <f.icon className="text-primary" size={22} />
              </div>
              <h3 className="font-heading font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-muted text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-8 px-6 text-center text-muted text-sm">
        <div className="flex items-center justify-center gap-2">
          <Compass size={16} className="text-primary" />
          GlobeTrotter — Built for Hackathon 2026
        </div>
      </footer>
    </div>
  )
}
