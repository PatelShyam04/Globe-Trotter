import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const SAMPLE_COMMUNITY_TRIPS: Record<string, any> = {
  'comm-1': {
    id: 'comm-1',
    name: '10 Days Across Tokyo, Kyoto & Osaka',
    description:
      'The ultimate Japan food and culture trail! Started with ramen hunting in Shibuya, morning bamboo groves in Arashiyama, and street food feast in Dotonbori. Budget was super manageable with regional rail passes.',
    startDate: '2025-04-10',
    endDate: '2025-04-20',
    coverPhoto: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
    totalBudget: 2400,
    user: { name: 'Maya Tanaka', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
    stops: [
      {
        id: 's1',
        cityName: 'Tokyo',
        country: 'Japan',
        activities: [
          { id: 'a1', name: 'Tsukiji Outer Market Food Tour', category: 'food', cost: 45, scheduledTime: '09:00 AM', dayNumber: 1 },
          { id: 'a2', name: 'Shibuya Crossing & Meiji Shrine', category: 'sightseeing', cost: 0, scheduledTime: '02:00 PM', dayNumber: 1 },
          { id: 'a3', name: 'Akihabara Tech & Anime Exploration', category: 'sightseeing', cost: 25, scheduledTime: '06:00 PM', dayNumber: 2 },
        ],
      },
      {
        id: 's2',
        cityName: 'Kyoto',
        country: 'Japan',
        activities: [
          { id: 'a4', name: 'Fushimi Inari 10,000 Torii Gates', category: 'sightseeing', cost: 0, scheduledTime: '07:30 AM', dayNumber: 4 },
          { id: 'a5', name: 'Traditional Tea Ceremony in Gion', category: 'food', cost: 60, scheduledTime: '03:00 PM', dayNumber: 5 },
        ],
      },
      {
        id: 's3',
        cityName: 'Osaka',
        country: 'Japan',
        activities: [
          { id: 'a6', name: 'Dotonbori Street Food Feast', category: 'food', cost: 50, scheduledTime: '07:00 PM', dayNumber: 7 },
          { id: 'a7', name: 'Osaka Castle Tour', category: 'sightseeing', cost: 15, scheduledTime: '11:00 AM', dayNumber: 8 },
        ],
      },
    ],
  },
  'comm-2': {
    id: 'comm-2',
    name: 'Classic European Summer: Paris to Rome',
    description:
      'Unforgettable backpacking journey across Western Europe. Louvre at night, sunrise hike up Swiss peaks, and wood-fired pizza near the Trevi fountain. Highly recommend booking museums in advance.',
    startDate: '2025-07-01',
    endDate: '2025-07-14',
    coverPhoto: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
    totalBudget: 3200,
    user: { name: 'Liam Vance', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
    stops: [
      {
        id: 's4',
        cityName: 'Paris',
        country: 'France',
        activities: [
          { id: 'a8', name: 'Eiffel Tower Sunset Access', category: 'sightseeing', cost: 70, scheduledTime: '06:30 PM', dayNumber: 1 },
          { id: 'a9', name: 'Louvre Museum Guided Tour', category: 'sightseeing', cost: 55, scheduledTime: '10:00 AM', dayNumber: 2 },
        ],
      },
      {
        id: 's5',
        cityName: 'Zurich',
        country: 'Switzerland',
        activities: [
          { id: 'a10', name: 'Lake Zurich Scenic Boat Tour', category: 'sightseeing', cost: 50, scheduledTime: '02:00 PM', dayNumber: 5 },
        ],
      },
      {
        id: 's6',
        cityName: 'Rome',
        country: 'Italy',
        activities: [
          { id: 'a11', name: 'Colosseum & Roman Forum Tour', category: 'sightseeing', cost: 65, scheduledTime: '09:00 AM', dayNumber: 8 },
          { id: 'a12', name: 'Authentic Roman Pasta Cooking Class', category: 'food', cost: 80, scheduledTime: '05:00 PM', dayNumber: 9 },
        ],
      },
    ],
  },
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (SAMPLE_COMMUNITY_TRIPS[params.id]) {
      return NextResponse.json(SAMPLE_COMMUNITY_TRIPS[params.id])
    }

    const trip = await prisma.trip.findUnique({
      where: { id: params.id, isPublic: true },
      include: {
        user: { select: { name: true, image: true } },
        stops: {
          include: { activities: { orderBy: [{ dayNumber: 'asc' }, { scheduledTime: 'asc' }] } },
          orderBy: { orderIndex: 'asc' },
        },
      },
    })

    if (!trip) return NextResponse.json({ error: 'Trip not found or not public' }, { status: 404 })

    return NextResponse.json(trip)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch public trip' }, { status: 500 })
  }
}
