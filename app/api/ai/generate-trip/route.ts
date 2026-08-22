import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getDestinationPhoto } from '@/lib/photos'

interface TripPlanPayload {
  destination: string
  country?: string
  days?: number
  budget?: number
  style?: string // 'adventure' | 'cultural' | 'food' | 'balanced'
  autoSave?: boolean
  apiKey?: string
}

// Regional cost multiplier matrix
const REGION_COST_MAP: Record<string, { costIndex: number; defaultCountry: string }> = {
  tokyo: { costIndex: 1.2, defaultCountry: 'Japan' },
  kyoto: { costIndex: 1.1, defaultCountry: 'Japan' },
  osaka: { costIndex: 1.0, defaultCountry: 'Japan' },
  paris: { costIndex: 1.4, defaultCountry: 'France' },
  nice: { costIndex: 1.3, defaultCountry: 'France' },
  rome: { costIndex: 1.2, defaultCountry: 'Italy' },
  florence: { costIndex: 1.2, defaultCountry: 'Italy' },
  venice: { costIndex: 1.4, defaultCountry: 'Italy' },
  london: { costIndex: 1.5, defaultCountry: 'United Kingdom' },
  barcelona: { costIndex: 1.1, defaultCountry: 'Spain' },
  madrid: { costIndex: 1.0, defaultCountry: 'Spain' },
  bali: { costIndex: 0.6, defaultCountry: 'Indonesia' },
  bangkok: { costIndex: 0.6, defaultCountry: 'Thailand' },
  phuket: { costIndex: 0.7, defaultCountry: 'Thailand' },
  singapore: { costIndex: 1.4, defaultCountry: 'Singapore' },
  dubai: { costIndex: 1.5, defaultCountry: 'UAE' },
  zurich: { costIndex: 1.7, defaultCountry: 'Switzerland' },
  cairo: { costIndex: 0.5, defaultCountry: 'Egypt' },
  sydney: { costIndex: 1.4, defaultCountry: 'Australia' },
  melbourne: { costIndex: 1.3, defaultCountry: 'Australia' },
  newyork: { costIndex: 1.6, defaultCountry: 'USA' },
  sanfrancisco: { costIndex: 1.6, defaultCountry: 'USA' },
  prague: { costIndex: 0.8, defaultCountry: 'Czech Republic' },
  amsterdam: { costIndex: 1.3, defaultCountry: 'Netherlands' },
  berlin: { costIndex: 1.1, defaultCountry: 'Germany' },
  seoul: { costIndex: 1.1, defaultCountry: 'South Korea' },
  mumbai: { costIndex: 0.5, defaultCountry: 'India' },
  delhi: { costIndex: 0.5, defaultCountry: 'India' },
  jaipur: { costIndex: 0.5, defaultCountry: 'India' },
  jaypur: { costIndex: 0.5, defaultCountry: 'India' },
  ahmedabad: { costIndex: 0.5, defaultCountry: 'India' },
  santorini: { costIndex: 1.3, defaultCountry: 'Greece' },
  iceland: { costIndex: 1.5, defaultCountry: 'Iceland' },
  reykjavik: { costIndex: 1.5, defaultCountry: 'Iceland' },
  capetown: { costIndex: 0.7, defaultCountry: 'South Africa' },
  riodejaneiro: { costIndex: 0.7, defaultCountry: 'Brazil' },
}

// Specific authentic landmarks and activity plans for top global cities
const SPECIFIC_CITY_LANDMARKS: Record<string, { name: string; category: string; cost: number; scheduledTime: string; dayNumber: number }[]> = {
  jaipur: [
    { name: 'Hawa Mahal (Palace of Winds) & City Palace Guided Tour', category: 'sightseeing', cost: 15, scheduledTime: '09:30 AM', dayNumber: 1 },
    { name: 'Authentic Rajasthani Thali & Lassi at Lassiwala MI Road', category: 'food', cost: 12, scheduledTime: '01:00 PM', dayNumber: 1 },
    { name: 'Nahargarh Fort Panoramic Sunset Viewpoint', category: 'sightseeing', cost: 8, scheduledTime: '05:30 PM', dayNumber: 1 },
    { name: 'Amber Fort & Sheesh Mahal (Mirror Palace) Elephant/Jeep Tour', category: 'adventure', cost: 22, scheduledTime: '09:00 AM', dayNumber: 2 },
    { name: 'Jantar Mantar Astronomical Observatory UNESCO Tour', category: 'sightseeing', cost: 10, scheduledTime: '02:00 PM', dayNumber: 2 },
    { name: 'Chokhi Dhani Ethnic Village Feast & Folk Music Experience', category: 'food', cost: 30, scheduledTime: '07:00 PM', dayNumber: 2 },
    { name: 'Jal Mahal (Water Palace) & Lakeside Walk', category: 'sightseeing', cost: 0, scheduledTime: '09:30 AM', dayNumber: 3 },
    { name: 'Johari & Bapu Bazaar Block-Print & Gem Shopping', category: 'sightseeing', cost: 15, scheduledTime: '02:00 PM', dayNumber: 3 },
    { name: 'Albert Hall Museum & Evening Royal Illumination', category: 'sightseeing', cost: 10, scheduledTime: '06:30 PM', dayNumber: 3 },
  ],
  jaypur: [
    { name: 'Hawa Mahal (Palace of Winds) & City Palace Guided Tour', category: 'sightseeing', cost: 15, scheduledTime: '09:30 AM', dayNumber: 1 },
    { name: 'Authentic Rajasthani Thali & Lassi at Lassiwala MI Road', category: 'food', cost: 12, scheduledTime: '01:00 PM', dayNumber: 1 },
    { name: 'Nahargarh Fort Panoramic Sunset Viewpoint', category: 'sightseeing', cost: 8, scheduledTime: '05:30 PM', dayNumber: 1 },
    { name: 'Amber Fort & Sheesh Mahal (Mirror Palace) Elephant/Jeep Tour', category: 'adventure', cost: 22, scheduledTime: '09:00 AM', dayNumber: 2 },
    { name: 'Jantar Mantar Astronomical Observatory UNESCO Tour', category: 'sightseeing', cost: 10, scheduledTime: '02:00 PM', dayNumber: 2 },
    { name: 'Chokhi Dhani Ethnic Village Feast & Folk Music Experience', category: 'food', cost: 30, scheduledTime: '07:00 PM', dayNumber: 2 },
    { name: 'Jal Mahal (Water Palace) & Lakeside Walk', category: 'sightseeing', cost: 0, scheduledTime: '09:30 AM', dayNumber: 3 },
    { name: 'Johari & Bapu Bazaar Block-Print & Gem Shopping', category: 'sightseeing', cost: 15, scheduledTime: '02:00 PM', dayNumber: 3 },
    { name: 'Albert Hall Museum & Evening Royal Illumination', category: 'sightseeing', cost: 10, scheduledTime: '06:30 PM', dayNumber: 3 },
  ],
  bali: [
    { name: 'Ubud Sacred Monkey Forest Sanctuary & Jungle Walk', category: 'sightseeing', cost: 10, scheduledTime: '09:30 AM', dayNumber: 1 },
    { name: 'Tegallalang Rice Terraces Trek & Jungle Swing', category: 'adventure', cost: 15, scheduledTime: '01:00 PM', dayNumber: 1 },
    { name: 'Ubud Traditional Art Market & Organic Balinese Lunch', category: 'food', cost: 20, scheduledTime: '04:30 PM', dayNumber: 1 },
    { name: 'Nusa Penida Island Kelingking Cliff & Snorkeling Day Trip', category: 'adventure', cost: 65, scheduledTime: '07:30 AM', dayNumber: 2 },
    { name: 'Jimbaran Bay Candlelight Seafood Feast on the Beach', category: 'food', cost: 35, scheduledTime: '07:30 PM', dayNumber: 2 },
    { name: 'Uluwatu Clifftop Temple & Sunset Kecak Fire Dance', category: 'sightseeing', cost: 20, scheduledTime: '04:30 PM', dayNumber: 3 },
    { name: 'Seminyak Beach Club Sunset Lounge & Dinner', category: 'food', cost: 35, scheduledTime: '08:00 PM', dayNumber: 3 },
  ],
  tokyo: [
    { name: 'Tsukiji Outer Market Fresh Sushi & Sashimi Tasting Tour', category: 'food', cost: 35, scheduledTime: '09:00 AM', dayNumber: 1 },
    { name: 'Shibuya Crossing & Shibuya Sky 360° Observation Deck', category: 'sightseeing', cost: 22, scheduledTime: '02:00 PM', dayNumber: 1 },
    { name: 'Shinjuku Omoide Yokocho Izakaya Street Food Walk', category: 'food', cost: 30, scheduledTime: '07:00 PM', dayNumber: 1 },
    { name: 'Senso-ji Ancient Temple & Nakamise Souvenir Stroll in Asakusa', category: 'sightseeing', cost: 5, scheduledTime: '09:30 AM', dayNumber: 2 },
    { name: 'TeamLab Planets Immersive Digital Art Museum', category: 'adventure', cost: 35, scheduledTime: '02:00 PM', dayNumber: 2 },
    { name: 'Akihabara Electric Town Anime & Arcade Exploration', category: 'sightseeing', cost: 15, scheduledTime: '06:30 PM', dayNumber: 2 },
    { name: 'Meiji Jingu Shinto Shrine & Yoyogi Forest Walk', category: 'sightseeing', cost: 0, scheduledTime: '10:00 AM', dayNumber: 3 },
    { name: 'Harajuku Takeshita Street Crepe & Fashion Walk', category: 'food', cost: 15, scheduledTime: '01:30 PM', dayNumber: 3 },
    { name: 'Roppongi Hills Skydeck Sunset & Craft Ramen Dinner', category: 'food', cost: 28, scheduledTime: '06:30 PM', dayNumber: 3 },
  ],
  paris: [
    { name: 'Eiffel Tower Summit Access & Trocadéro Gardens Panorama', category: 'sightseeing', cost: 45, scheduledTime: '09:30 AM', dayNumber: 1 },
    { name: 'Le Marais Historic District Bakery & Croissant Tasting', category: 'food', cost: 25, scheduledTime: '01:30 PM', dayNumber: 1 },
    { name: 'Seine River Sunset Catamaran Cruise with Champagne', category: 'sightseeing', cost: 35, scheduledTime: '06:30 PM', dayNumber: 1 },
    { name: 'Louvre Museum Mona Lisa & Classical Sculpture Masterpieces', category: 'sightseeing', cost: 22, scheduledTime: '09:30 AM', dayNumber: 2 },
    { name: 'Tuileries Garden Stroll & Hot Chocolate at Angelina', category: 'food', cost: 18, scheduledTime: '02:00 PM', dayNumber: 2 },
    { name: 'Montmartre Artists Square & Sacré-Cœur Basilica Sunset', category: 'sightseeing', cost: 0, scheduledTime: '06:00 PM', dayNumber: 2 },
    { name: 'Sainte-Chapelle Radiant Stained Glass & Notre-Dame Walk', category: 'sightseeing', cost: 15, scheduledTime: '10:00 AM', dayNumber: 3 },
    { name: 'Latin Quarter Historic Bistro Lunch & Luxembourg Gardens', category: 'food', cost: 32, scheduledTime: '01:30 PM', dayNumber: 3 },
    { name: 'Arc de Triomphe Rooftop Sunset View & Champs-Élysées Walk', category: 'sightseeing', cost: 16, scheduledTime: '06:30 PM', dayNumber: 3 },
  ],
  rome: [
    { name: 'Colosseum Gladiator Arena & Roman Forum Guided Walk', category: 'sightseeing', cost: 35, scheduledTime: '09:00 AM', dayNumber: 1 },
    { name: 'Trastevere Traditional Handmade Cacio e Pepe Pasta Lunch', category: 'food', cost: 25, scheduledTime: '01:30 PM', dayNumber: 1 },
    { name: 'Trevi Fountain & Spanish Steps Evening Gelato Stroll', category: 'food', cost: 10, scheduledTime: '06:00 PM', dayNumber: 1 },
    { name: 'Vatican Museums & Michelangelo Sistine Chapel Masterpieces', category: 'sightseeing', cost: 30, scheduledTime: '09:00 AM', dayNumber: 2 },
    { name: 'St. Peters Basilica Dome Climb for St. Peters Square Panorama', category: 'sightseeing', cost: 12, scheduledTime: '01:30 PM', dayNumber: 2 },
    { name: 'Piazza Navona & Ancient Pantheon Dome Architecture Walk', category: 'sightseeing', cost: 5, scheduledTime: '05:30 PM', dayNumber: 2 },
    { name: 'Borghese Gallery Renaissance Sculpture & Villa Gardens', category: 'sightseeing', cost: 20, scheduledTime: '10:00 AM', dayNumber: 3 },
    { name: 'Campo de Fiori Historic Market & Roman Pizza al Taglio', category: 'food', cost: 15, scheduledTime: '01:30 PM', dayNumber: 3 },
    { name: 'Pincio Terrace Sunset & Candlelit Rooftop Roman Dinner', category: 'food', cost: 50, scheduledTime: '07:30 PM', dayNumber: 3 },
  ],
}

async function fetchGeminiItinerary(destination: string, country: string, days: number, style: string, apiKey?: string) {
  const key = apiKey || process.env.GEMINI_API_KEY
  if (!key) return null

  try {
    const prompt = `Generate a realistic ${days}-day travel itinerary for ${destination}, ${country} focused on ${style} experiences.
For each day, return 2 to 3 real famous landmark attractions, specific monuments, authentic restaurants/dishes, or top activities.
Return ONLY valid JSON array in this exact format with no extra text or markdown formatting:
[
  {
    "name": "Exact Landmark or Place Name (e.g. Hawa Mahal & City Palace or Shibuya Sky Deck)",
    "category": "sightseeing", // one of: "sightseeing", "adventure", "food", "transport", "stay"
    "cost": 25, // estimated ticket/meal cost in USD as a number
    "scheduledTime": "09:30 AM",
    "dayNumber": 1
  }
]`

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      }),
    })

    if (res.ok) {
      const data = await res.json()
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text
      if (text) {
        const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim()
        const parsed = JSON.parse(cleanJson)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed
        }
      }
    }
  } catch (err) {
    console.warn('Gemini API call failed, falling back to local landmark engine:', err)
  }
  return null
}

function generateDynamicActivities(cityName: string, countryName: string, days: number, style: string) {
  const normCity = cityName.toLowerCase().replace(/[^a-z]/g, '')
  if (SPECIFIC_CITY_LANDMARKS[normCity]) {
    const curated = SPECIFIC_CITY_LANDMARKS[normCity]
    return curated.filter((a) => a.dayNumber <= days)
  }

  // Dynamic fallback generating authentic landmark-based experiences
  const activities: { name: string; category: string; cost: number; scheduledTime: string; dayNumber: number }[] = []

  for (let day = 1; day <= days; day++) {
    if (day === 1) {
      activities.push({
        name: `Historic Old Town & Central Square Walking Tour in ${cityName}`,
        category: 'sightseeing',
        cost: 0,
        scheduledTime: '09:30 AM',
        dayNumber: 1,
      })
      activities.push({
        name: `Authentic Regional Street Food & Traditional Market Tasting in ${cityName}`,
        category: 'food',
        cost: 25,
        scheduledTime: '01:00 PM',
        dayNumber: 1,
      })
      activities.push({
        name: `Sunset Panorama & Skyline Viewpoint Experience in ${cityName}`,
        category: 'sightseeing',
        cost: 15,
        scheduledTime: '06:00 PM',
        dayNumber: 1,
      })
    } else if (day === 2) {
      activities.push({
        name: `Iconic National Landmark & Historic Citadel / Palace in ${cityName}`,
        category: 'sightseeing',
        cost: 35,
        scheduledTime: '09:30 AM',
        dayNumber: 2,
      })
      activities.push({
        name: `Artisan Bazaar, Local Handicrafts & Spice Walk`,
        category: 'sightseeing',
        cost: 10,
        scheduledTime: '02:00 PM',
        dayNumber: 2,
      })
      activities.push({
        name: `Evening Scenic Waterfront / River Cruise & Traditional Dining`,
        category: 'food',
        cost: 45,
        scheduledTime: '07:30 PM',
        dayNumber: 2,
      })
    } else if (day === 3) {
      activities.push({
        name: `Scenic Nature Excursion & Mountain / Beach Day Trip near ${cityName}`,
        category: 'adventure',
        cost: 50,
        scheduledTime: '08:30 AM',
        dayNumber: 3,
      })
      activities.push({
        name: `Celebrated Heritage Feast & Live Cultural Music Evening`,
        category: 'food',
        cost: 40,
        scheduledTime: '07:00 PM',
        dayNumber: 3,
      })
    } else {
      activities.push({
        name: `Hidden Gems & Local Neighborhood Immersion (Day ${day}) in ${cityName}`,
        category: 'sightseeing',
        cost: 20,
        scheduledTime: '10:00 AM',
        dayNumber: day,
      })
      activities.push({
        name: `Farewell Dinner Feast at Top-Rated Local Bistro in ${cityName}`,
        category: 'food',
        cost: 35,
        scheduledTime: '07:00 PM',
        dayNumber: day,
      })
    }
  }

  return activities
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    const body: TripPlanPayload = await req.json()

    const destination = body.destination?.trim() || 'Paris'
    const days = Math.min(14, Math.max(1, body.days || 3))
    const style = body.style || 'balanced'

    // Clean destination
    const normalizedKey = destination.toLowerCase().replace(/[^a-z]/g, '')
    const regionInfo = REGION_COST_MAP[normalizedKey]
    const country = body.country || regionInfo?.defaultCountry || 'Global'
    const costIndex = regionInfo?.costIndex || 1.1

    // Calculate budget
    const baseDailyCost = Math.round(90 * costIndex)
    const suggestedBudget = body.budget || (baseDailyCost * days)

    const tripName = `${days}-Day ${destination} ${style.charAt(0).toUpperCase() + style.slice(1)} Journey`
    const tripDescription = `Curated by GlobeBot AI for ${destination}, ${country}. Includes daily highlights, iconic landmarks, and culinary experiences.`

    const startDate = new Date()
    startDate.setDate(startDate.getDate() + 14) // default 2 weeks out automatically
    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + (days - 1))

    // 1. Try Gemini GenAI if API key available; otherwise use rich landmark database!
    let activities = await fetchGeminiItinerary(destination, country, days, style, body.apiKey)
    if (!activities || activities.length === 0) {
      activities = generateDynamicActivities(destination, country, days, style)
    }

    // If autoSave requested and user is authenticated, create in PostgreSQL!
    if (body.autoSave) {
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Please sign in to save trip to your account' }, { status: 401 })
      }

      const createdTrip = await prisma.trip.create({
        data: {
          userId: session.user.id,
          name: tripName,
          description: tripDescription,
          startDate,
          endDate,
          coverPhoto: getDestinationPhoto(destination),
          totalBudget: suggestedBudget,
          isPublic: false,
          stops: {
            create: [
              {
                cityName: destination,
                country,
                costIndex,
                orderIndex: 0,
                arrivalDate: startDate,
                departureDate: endDate,
                activities: {
                  create: activities.map((a) => ({
                    name: a.name,
                    category: a.category,
                    cost: typeof a.cost === 'number' ? a.cost : 25,
                    scheduledTime: a.scheduledTime || '10:00 AM',
                    dayNumber: a.dayNumber || 1,
                  })),
                },
              },
            ],
          },
        },
      })

      return NextResponse.json({
        success: true,
        tripId: createdTrip.id,
        tripName,
        destination,
        country,
        days,
        suggestedBudget,
      })
    }

    // Otherwise return the planned payload for preview
    return NextResponse.json({
      tripName,
      description: tripDescription,
      destination,
      country,
      days,
      costIndex,
      suggestedBudget,
      dailyAvgCost: Math.round(suggestedBudget / days),
      activities,
    })
  } catch (error) {
    console.error('Auto trip generation error:', error)
    return NextResponse.json({ error: 'Failed to generate auto trip' }, { status: 500 })
  }
}
