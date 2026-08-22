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
  capetown: { costIndex: 0.7, defaultCountry: 'South Africa' },
  riodejaneiro: { costIndex: 0.7, defaultCountry: 'Brazil' },
}

function generateDynamicActivities(cityName: string, countryName: string, days: number, style: string) {
  const activities: { name: string; category: string; cost: number; scheduledTime: string; dayNumber: number }[] = []

  const styleMap: Record<string, { cat1: string; cat2: string; cat3: string }> = {
    food: { cat1: 'food', cat2: 'sightseeing', cat3: 'food' },
    adventure: { cat1: 'adventure', cat2: 'adventure', cat3: 'sightseeing' },
    cultural: { cat1: 'sightseeing', cat2: 'sightseeing', cat3: 'food' },
    balanced: { cat1: 'sightseeing', cat2: 'food', cat3: 'adventure' },
  }

  const selectedStyle = styleMap[style.toLowerCase()] || styleMap.balanced

  for (let day = 1; day <= days; day++) {
    if (day === 1) {
      activities.push({
        name: `Arrival & Historic Old Town Walking Exploration in ${cityName}`,
        category: 'sightseeing',
        cost: 0,
        scheduledTime: '10:00 AM',
        dayNumber: 1,
      })
      activities.push({
        name: `Authentic Local Street Food & Culinary Tasting in ${cityName}`,
        category: 'food',
        cost: 35,
        scheduledTime: '01:00 PM',
        dayNumber: 1,
      })
      activities.push({
        name: `Sunset Panoramic Viewpoint & Skyline Experience in ${cityName}`,
        category: 'sightseeing',
        cost: 20,
        scheduledTime: '06:00 PM',
        dayNumber: 1,
      })
    } else if (day === 2) {
      activities.push({
        name: `Iconic Landmark & National Museum Guided Tour in ${cityName}`,
        category: selectedStyle.cat1,
        cost: 45,
        scheduledTime: '09:30 AM',
        dayNumber: 2,
      })
      activities.push({
        name: `Traditional Artisan Market & Local Souvenir Walk`,
        category: 'sightseeing',
        cost: 15,
        scheduledTime: '02:00 PM',
        dayNumber: 2,
      })
      activities.push({
        name: `Evening River/Harbor Cruise or Traditional Dining Show`,
        category: selectedStyle.cat2,
        cost: 55,
        scheduledTime: '07:30 PM',
        dayNumber: 2,
      })
    } else if (day === 3) {
      activities.push({
        name: `Nature / Mountain / Scenic Day Excursion outside ${cityName}`,
        category: 'adventure',
        cost: 65,
        scheduledTime: '08:30 AM',
        dayNumber: 3,
      })
      activities.push({
        name: `Celebrated Chef Dinner & Craft Beverage Experience`,
        category: 'food',
        cost: 70,
        scheduledTime: '07:00 PM',
        dayNumber: 3,
      })
    } else {
      activities.push({
        name: `Hidden Gems & Neighborhood Immersion (Day ${day}) in ${cityName}`,
        category: selectedStyle.cat1,
        cost: 30,
        scheduledTime: '10:00 AM',
        dayNumber: day,
      })
      activities.push({
        name: `Farewell Celebration Feast & Evening Night Market`,
        category: 'food',
        cost: 40,
        scheduledTime: '06:30 PM',
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
    const tripDescription = `Curated by GlobeBot AI for ${destination}, ${country}. Includes daily highlights, cultural tours, and culinary experiences.`

    const startDate = new Date()
    startDate.setDate(startDate.getDate() + 14) // default 2 weeks out
    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + (days - 1))

    const activities = generateDynamicActivities(destination, country, days, style)

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
                    cost: a.cost,
                    scheduledTime: a.scheduledTime,
                    dayNumber: a.dayNumber,
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
