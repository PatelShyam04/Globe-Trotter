import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const SAMPLE_COMMUNITY_TRIPS: Record<string, any> = {
  'comm-1': {
    name: '10 Days Across Tokyo, Kyoto & Osaka (Copy)',
    description: 'The ultimate Japan food and culture trail! Cloned from community.',
    startDate: new Date('2025-04-10'),
    endDate: new Date('2025-04-20'),
    coverPhoto: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
    totalBudget: 2400,
    stops: [
      {
        cityName: 'Tokyo',
        country: 'Japan',
        costIndex: 1.2,
        orderIndex: 0,
        activities: [
          { name: 'Tsukiji Outer Market Food Tour', category: 'food', cost: 45, scheduledTime: '09:00 AM', dayNumber: 1 },
          { name: 'Shibuya Crossing & Meiji Shrine', category: 'sightseeing', cost: 0, scheduledTime: '02:00 PM', dayNumber: 1 },
          { name: 'Akihabara Tech & Anime Exploration', category: 'sightseeing', cost: 25, scheduledTime: '06:00 PM', dayNumber: 2 },
        ],
      },
      {
        cityName: 'Kyoto',
        country: 'Japan',
        costIndex: 1.1,
        orderIndex: 1,
        activities: [
          { name: 'Fushimi Inari 10,000 Torii Gates', category: 'sightseeing', cost: 0, scheduledTime: '07:30 AM', dayNumber: 4 },
          { name: 'Traditional Tea Ceremony in Gion', category: 'food', cost: 60, scheduledTime: '03:00 PM', dayNumber: 5 },
        ],
      },
      {
        cityName: 'Osaka',
        country: 'Japan',
        costIndex: 1.0,
        orderIndex: 2,
        activities: [
          { name: 'Dotonbori Street Food Feast', category: 'food', cost: 50, scheduledTime: '07:00 PM', dayNumber: 7 },
          { name: 'Osaka Castle Tour', category: 'sightseeing', cost: 15, scheduledTime: '11:00 AM', dayNumber: 8 },
        ],
      },
    ],
  },
  'comm-2': {
    name: 'Classic European Summer: Paris to Rome (Copy)',
    description: 'Unforgettable backpacking journey across Western Europe. Cloned from community.',
    startDate: new Date('2025-07-01'),
    endDate: new Date('2025-07-14'),
    coverPhoto: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
    totalBudget: 3200,
    stops: [
      {
        cityName: 'Paris',
        country: 'France',
        costIndex: 1.4,
        orderIndex: 0,
        activities: [
          { name: 'Eiffel Tower Sunset Access', category: 'sightseeing', cost: 70, scheduledTime: '06:30 PM', dayNumber: 1 },
          { name: 'Louvre Museum Guided Tour', category: 'sightseeing', cost: 55, scheduledTime: '10:00 AM', dayNumber: 2 },
        ],
      },
      {
        cityName: 'Zurich',
        country: 'Switzerland',
        costIndex: 1.6,
        orderIndex: 1,
        activities: [
          { name: 'Lake Zurich Scenic Boat Tour', category: 'sightseeing', cost: 50, scheduledTime: '02:00 PM', dayNumber: 5 },
        ],
      },
      {
        cityName: 'Rome',
        country: 'Italy',
        costIndex: 1.2,
        orderIndex: 2,
        activities: [
          { name: 'Colosseum & Roman Forum Tour', category: 'sightseeing', cost: 65, scheduledTime: '09:00 AM', dayNumber: 8 },
          { name: 'Authentic Roman Pasta Cooking Class', category: 'food', cost: 80, scheduledTime: '05:00 PM', dayNumber: 9 },
        ],
      },
    ],
  },
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Please sign in to copy this trip' }, { status: 401 })
  }

  const userId = session.user.id

  try {
    // Check if it's a sample community trip
    if (SAMPLE_COMMUNITY_TRIPS[params.id]) {
      const sample = SAMPLE_COMMUNITY_TRIPS[params.id]
      const newTrip = await prisma.trip.create({
        data: {
          userId,
          name: sample.name,
          description: sample.description,
          startDate: sample.startDate,
          endDate: sample.endDate,
          coverPhoto: sample.coverPhoto,
          totalBudget: sample.totalBudget,
          isPublic: false,
          stops: {
            create: sample.stops.map((s: any) => ({
              cityName: s.cityName,
              country: s.country,
              costIndex: s.costIndex,
              orderIndex: s.orderIndex,
              activities: {
                create: s.activities.map((a: any) => ({
                  name: a.name,
                  category: a.category,
                  cost: a.cost,
                  scheduledTime: a.scheduledTime,
                  dayNumber: a.dayNumber,
                })),
              },
            })),
          },
        },
      })
      return NextResponse.json({ tripId: newTrip.id })
    }

    // Otherwise clone from real DB trip
    const sourceTrip = await prisma.trip.findUnique({
      where: { id: params.id },
      include: {
        stops: {
          include: { activities: true },
          orderBy: { orderIndex: 'asc' },
        },
      },
    })

    if (!sourceTrip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
    }

    const clonedTrip = await prisma.trip.create({
      data: {
        userId,
        name: `${sourceTrip.name} (Copy)`,
        description: sourceTrip.description,
        startDate: sourceTrip.startDate,
        endDate: sourceTrip.endDate,
        coverPhoto: sourceTrip.coverPhoto,
        totalBudget: sourceTrip.totalBudget,
        isPublic: false,
        stops: {
          create: sourceTrip.stops.map((s: any) => ({
            cityName: s.cityName,
            country: s.country,
            arrivalDate: s.arrivalDate,
            departureDate: s.departureDate,
            orderIndex: s.orderIndex,
            costIndex: s.costIndex,
            activities: {
              create: s.activities.map((a: any) => ({
                name: a.name,
                category: a.category,
                description: a.description,
                cost: a.cost,
                durationHours: a.durationHours,
                scheduledTime: a.scheduledTime,
                dayNumber: a.dayNumber,
              })),
            },
          })),
        },
      },
    })

    return NextResponse.json({ tripId: clonedTrip.id })
  } catch (error) {
    console.error('Clone error:', error)
    return NextResponse.json({ error: 'Failed to copy trip' }, { status: 500 })
  }
}
