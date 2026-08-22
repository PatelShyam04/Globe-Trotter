import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'GlobeTrotter – Personalized Travel Planning',
  description: 'Plan multi-city trips, manage budgets, discover activities, and share your itineraries with the world.',
  keywords: 'travel planning, itinerary, budget, multi-city, trip planner',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-bg text-text font-body antialiased">
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1F2937',
              color: '#F9FAFB',
              border: '1px solid #374151',
              borderRadius: '12px',
            },
            success: {
              iconTheme: { primary: '#00D4AA', secondary: '#0A0F1E' },
            },
            error: {
              iconTheme: { primary: '#EF4444', secondary: '#0A0F1E' },
            },
          }}
        />
        {children}
      </body>
    </html>
  )
}
